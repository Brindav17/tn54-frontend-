import base64
import io
import os
import uuid

import torch

# Avoid oversubscribed/conflicting native thread pools across torch's own
# intra-op parallelism -- a plausible contributor to native (non-Python)
# crashes when multiple requests/libraries spin up their own thread pools.
torch.set_num_threads(1)

import torch.nn.functional as F
from dotenv import load_dotenv
from flask import Flask, request, jsonify
from flask_cors import CORS
from flask_jwt_extended import get_jwt_identity, jwt_required

load_dotenv()

from config import Config
from extensions import db, jwt, migrate
from auth import auth_bp
from model import resnet54_v2_regularized, CLASS_NAMES
from models import Prediction
from preprocessing import preprocess_image
from xai import generate_gradcam, generate_integrated_gradients

# Point MODEL_PATH at your resnet54_v2_REGULARIZED_acc0.9182.pth file, either
# by setting the env var or dropping the file at backend/weights/<name>.pth.
MODEL_PATH = os.environ.get("MODEL_PATH") or os.path.join(
    os.path.dirname(__file__), "weights", "resnet54_v2_REGULARIZED_acc0.9182.pth"
)
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN") or "http://localhost:5173"
STORAGE_DIR = os.path.join(os.path.dirname(__file__), "storage")
os.makedirs(STORAGE_DIR, exist_ok=True)

app = Flask(__name__)
app.config.from_object(Config)
CORS(app, resources={r"/predict": {"origins": ALLOWED_ORIGIN},
                      r"/predictions*": {"origins": ALLOWED_ORIGIN},
                      r"/auth/*": {"origins": ALLOWED_ORIGIN}})

db.init_app(app)
migrate.init_app(app, db)
jwt.init_app(app)
app.register_blueprint(auth_bp)

# Loaded on first /predict call rather than at import time, so the rest of
# the app (auth, DB) still starts up fine when the weights file isn't
# present yet -- e.g. while running the app for local auth/DB testing only.
_model = None


def _get_model():
    global _model
    if _model is None:
        if not os.path.exists(MODEL_PATH):
            raise FileNotFoundError(
                f"Model weights not found at {MODEL_PATH}. Set MODEL_PATH or drop the "
                ".pth file into backend/weights/."
            )
        print(f"Loading model from {MODEL_PATH} ...")
        m = resnet54_v2_regularized(num_classes=2, dropout_p=0.4, pretrained=False)
        state_dict = torch.load(MODEL_PATH, map_location="cpu")
        m.load_state_dict(state_dict, strict=True)
        m.eval()
        print("Model loaded.")
        _model = m
    return _model


def _save_base64_png(b64_data, path):
    with open(path, "wb") as f:
        f.write(base64.b64decode(b64_data))


@app.route("/predict", methods=["POST"])
@jwt_required()
def predict():
    try:
        model = _get_model()
    except FileNotFoundError as e:
        return jsonify({"error": str(e)}), 503

    if "image" not in request.files:
        return jsonify({"error": "No 'image' file in request"}), 400

    file = request.files["image"]
    image_bytes = file.read()
    try:
        input_tensor = preprocess_image(io.BytesIO(image_bytes))
    except Exception as e:
        return jsonify({"error": f"Could not read image: {e}"}), 400

    with torch.no_grad():
        logits = model(input_tensor)
        probs = F.softmax(logits, dim=1)[0]
        pred_idx = int(torch.argmax(probs).item())
        confidence = float(probs[pred_idx].item())

    # Grad-CAM / Integrated Gradients need gradients enabled on the input;
    # model params themselves never require grad (only used, not trained, here).
    input_tensor.requires_grad_()
    gradcam = generate_gradcam(model, input_tensor, pred_idx)
    integrated_gradients = generate_integrated_gradients(model, input_tensor, pred_idx)

    user_id = int(get_jwt_identity())
    pred_dir = os.path.join(STORAGE_DIR, str(user_id), str(uuid.uuid4()))
    os.makedirs(pred_dir, exist_ok=True)

    ext = os.path.splitext(file.filename or "")[1] or ".png"
    original_path = os.path.join(pred_dir, f"original{ext}")
    with open(original_path, "wb") as f:
        f.write(image_bytes)

    gradcam_overlay_path = os.path.join(pred_dir, "gradcam_overlay.png")
    gradcam_heatmap_path = os.path.join(pred_dir, "gradcam_heatmap.png")
    ig_overlay_path = os.path.join(pred_dir, "ig_overlay.png")
    ig_attribution_path = os.path.join(pred_dir, "ig_attribution.png")
    _save_base64_png(gradcam["overlay_png"], gradcam_overlay_path)
    _save_base64_png(gradcam["heatmap_png"], gradcam_heatmap_path)
    _save_base64_png(integrated_gradients["overlay_png"], ig_overlay_path)
    _save_base64_png(integrated_gradients["attribution_png"], ig_attribution_path)

    record = Prediction(
        user_id=user_id,
        original_image_path=os.path.relpath(original_path, STORAGE_DIR),
        predicted_label=CLASS_NAMES[pred_idx],
        confidence_score=confidence,
        gradcam_overlay_path=os.path.relpath(gradcam_overlay_path, STORAGE_DIR),
        gradcam_heatmap_path=os.path.relpath(gradcam_heatmap_path, STORAGE_DIR),
        ig_overlay_path=os.path.relpath(ig_overlay_path, STORAGE_DIR),
        ig_attribution_path=os.path.relpath(ig_attribution_path, STORAGE_DIR),
    )
    db.session.add(record)
    db.session.commit()

    return jsonify({
        "id": record.id,
        "prediction": record.predicted_label,
        "confidence": confidence,
        "gradcam": gradcam,
        "integrated_gradients": integrated_gradients,
        "created_at": record.created_at.isoformat(),
    })


@app.route("/predictions", methods=["GET"])
@jwt_required()
def list_predictions():
    user_id = int(get_jwt_identity())
    records = (
        Prediction.query.filter_by(user_id=user_id)
        .order_by(Prediction.created_at.desc())
        .all()
    )
    return jsonify([
        {
            "id": r.id,
            "prediction": r.predicted_label,
            "confidence": r.confidence_score,
            "created_at": r.created_at.isoformat(),
        }
        for r in records
    ])


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # use_reloader=False: avoids a second process double-loading the model
    # (and the native thread-pool issues noted above) once it's cached.
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
