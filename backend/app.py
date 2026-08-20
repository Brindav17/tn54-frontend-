import os

import torch

# Avoid oversubscribed/conflicting native thread pools across torch's own
# intra-op parallelism -- a plausible contributor to native (non-Python)
# crashes when multiple requests/libraries spin up their own thread pools.
torch.set_num_threads(1)

import torch.nn.functional as F
from flask import Flask, request, jsonify
from flask_cors import CORS

from model import resnet54_v2_regularized, CLASS_NAMES
from preprocessing import preprocess_image
from xai import generate_gradcam, generate_integrated_gradients

# Point MODEL_PATH at your resnet54_v2_REGULARIZED_acc0.9182.pth file, either
# by setting the env var or dropping the file at backend/weights/<name>.pth.
MODEL_PATH = os.environ.get(
    "MODEL_PATH",
    os.path.join(os.path.dirname(__file__), "weights", "resnet54_v2_REGULARIZED_acc0.9182.pth"),
)
ALLOWED_ORIGIN = os.environ.get("ALLOWED_ORIGIN", "http://localhost:5173")

app = Flask(__name__)
CORS(app, resources={r"/predict": {"origins": ALLOWED_ORIGIN}})

print(f"Loading model from {MODEL_PATH} ...")
model = resnet54_v2_regularized(num_classes=2, dropout_p=0.4, pretrained=False)
state_dict = torch.load(MODEL_PATH, map_location="cpu")
model.load_state_dict(state_dict, strict=True)
model.eval()
print("Model loaded.")


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No 'image' file in request"}), 400

    file = request.files["image"]
    try:
        input_tensor = preprocess_image(file.stream)
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

    return jsonify({
        "prediction": CLASS_NAMES[pred_idx],
        "confidence": confidence,
        "gradcam": gradcam,
        "integrated_gradients": integrated_gradients,
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


if __name__ == "__main__":
    # use_reloader=False: the model is loaded once at module import time above;
    # Flask's debug reloader would otherwise spawn a second process and load it twice.
    app.run(host="0.0.0.0", port=5000, debug=True, use_reloader=False)
