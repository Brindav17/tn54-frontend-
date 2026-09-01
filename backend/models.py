from datetime import datetime, timezone

from extensions import db


def _utcnow():
    return datetime.now(timezone.utc)


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), unique=True, nullable=False, index=True)
    # Nullable -- null for Google-only accounts. Bcrypt hash, never plaintext.
    password_hash = db.Column(db.String(255), nullable=True)
    # Google's stable user ID.
    google_sub = db.Column(db.String(255), unique=True, nullable=True, index=True)
    display_name = db.Column(db.String(255), nullable=True)
    profile_picture_url = db.Column(db.String(512), nullable=True)
    auth_provider = db.Column(db.String(20), nullable=False, default="local")  # local | google | both
    is_active = db.Column(db.Boolean, nullable=False, default=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow)
    updated_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow, onupdate=_utcnow)

    predictions = db.relationship(
        "Prediction",
        backref="user",
        cascade="all, delete-orphan",
        order_by="Prediction.created_at.desc()",
    )


class Prediction(db.Model):
    __tablename__ = "predictions"

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(
        db.Integer, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True
    )
    original_image_path = db.Column(db.String(512), nullable=False)
    predicted_label = db.Column(db.String(20), nullable=False)  # Benign | Malignant
    confidence_score = db.Column(db.Float, nullable=False)
    gradcam_overlay_path = db.Column(db.String(512), nullable=True)
    gradcam_heatmap_path = db.Column(db.String(512), nullable=True)
    ig_overlay_path = db.Column(db.String(512), nullable=True)
    ig_attribution_path = db.Column(db.String(512), nullable=True)
    created_at = db.Column(db.DateTime(timezone=True), nullable=False, default=_utcnow, index=True)
