import re

import bcrypt
from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity, jwt_required
from google.auth.transport import requests as google_requests
from google.oauth2 import id_token as google_id_token

from extensions import db
from models import User

auth_bp = Blueprint("auth", __name__, url_prefix="/auth")

EMAIL_RE = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")


def _user_payload(user):
    return {
        "id": user.id,
        "email": user.email,
        "display_name": user.display_name,
        "profile_picture_url": user.profile_picture_url,
        "auth_provider": user.auth_provider,
    }


@auth_bp.route("/register", methods=["POST"])
def register():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    if not EMAIL_RE.match(email):
        return jsonify({"error": "Invalid email"}), 400
    if len(password) < 8:
        return jsonify({"error": "Password must be at least 8 characters"}), 400
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "An account with this email already exists"}), 409

    password_hash = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
    user = User(email=email, password_hash=password_hash, auth_provider="local")
    db.session.add(user)
    db.session.commit()

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": _user_payload(user)}), 201


@auth_bp.route("/login", methods=["POST"])
def login():
    data = request.get_json(silent=True) or {}
    email = (data.get("email") or "").strip().lower()
    password = data.get("password") or ""

    user = User.query.filter_by(email=email).first()
    if not user or not user.password_hash:
        return jsonify({"error": "Invalid email or password"}), 401
    if not bcrypt.checkpw(password.encode("utf-8"), user.password_hash.encode("utf-8")):
        return jsonify({"error": "Invalid email or password"}), 401
    if not user.is_active:
        return jsonify({"error": "Account is disabled"}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": _user_payload(user)}), 200


@auth_bp.route("/google", methods=["POST"])
def google_login():
    data = request.get_json(silent=True) or {}
    token = data.get("id_token")
    if not token:
        return jsonify({"error": "Missing id_token"}), 400

    client_id = current_app.config.get("GOOGLE_CLIENT_ID")
    if not client_id:
        return jsonify({"error": "Google sign-in is not configured on the server"}), 500

    try:
        claims = google_id_token.verify_oauth2_token(token, google_requests.Request(), client_id)
    except ValueError:
        return jsonify({"error": "Invalid Google token"}), 401

    google_sub = claims["sub"]
    email = (claims.get("email") or "").strip().lower()

    user = User.query.filter_by(google_sub=google_sub).first()
    if not user:
        user = User.query.filter_by(email=email).first()
        if user:
            # Existing local-password account -- link the Google identity to it.
            user.auth_provider = "both"
        else:
            user = User(email=email, auth_provider="google")
            db.session.add(user)
        user.google_sub = google_sub

    user.display_name = user.display_name or claims.get("name")
    user.profile_picture_url = claims.get("picture") or user.profile_picture_url
    db.session.commit()

    if not user.is_active:
        return jsonify({"error": "Account is disabled"}), 403

    token = create_access_token(identity=str(user.id))
    return jsonify({"access_token": token, "user": _user_payload(user)}), 200


@auth_bp.route("/me", methods=["GET"])
@jwt_required()
def me():
    user = db.session.get(User, int(get_jwt_identity()))
    if not user:
        return jsonify({"error": "User not found"}), 404
    return jsonify(_user_payload(user)), 200
