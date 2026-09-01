# TN-54 Ultrasound Nodule Classifier

A full-stack application built around our published research project, *"Ultrasound Thyroid Nodule Classification Using an Enhanced ResNet-54 Backbone with Dual Interpretability Methods."* Authenticated users upload a thyroid ultrasound nodule image and get back a benign/malignant classification, explained with Grad-CAM (region-level) and Integrated Gradients (pixel-level) overlays. Every prediction is persisted per-user, with a history view backed by a real database.

This README covers the whole system — frontend, API, database, and auth — not just the model. For the research writeup itself, see the in-app **About** / **Architecture** pages and `final_resnet_config_project.py`.

**Dataset:** TN5000 — 5,000 biopsy-verified thyroid ultrasound images

> **Scope note:** the model was trained on ROI-cropped nodule patches (cropped via ground-truth bounding boxes), not full raw ultrasound frames. There is no nodule-localization/detection model in this pipeline, so the upload flow expects an already-cropped nodule image (see `TN5000_crops/test` for examples) rather than a full scan.

## Results at a glance (Regularized ResNet-54, TN5000 test set)
| Metric | Value |
|---|---|
| Validation Accuracy | 91.82% |
| Test Accuracy | 87.05% |
| F1-Score | 91.55% |
| Sensitivity | 96.04% |
| AUC-ROC | 90.19% |

## Architecture

```
┌──────────────┐   JWT (Bearer)   ┌───────────────────────┐         ┌──────────────┐
│  React (Vite) │ ───────────────▶ │      Flask API         │ ──────▶ │  ResNet-54    │
│  frontend     │ ◀─────────────── │  /auth/*  /predict      │ ◀────── │  + Grad-CAM   │
│  :5173        │   JSON           │  /predictions  /health  │  probs  │  + Int. Grad. │
└──────────────┘                  └───────────┬────────────┘         └──────────────┘
                                               │
                                    SQLAlchemy │ ORM
                                               ▼
                                   ┌───────────────────────┐
                                   │  users / predictions    │
                                   │  (SQLite dev / Postgres)│
                                   └───────────────────────┘
```

- **Auth** is stateless JWT: the backend never holds server-side sessions. A successful login/register/Google sign-in returns an access token; the frontend stores it and attaches `Authorization: Bearer <token>` to every protected request.
- **`/predict`** is a protected route — every prediction is tied to the authenticated user (`user_id`), and the original image plus all four generated XAI images are written to `backend/storage/<user_id>/<uuid>/` with their paths recorded on the `predictions` row.
- **`/predictions`** returns the calling user's own history only (filtered by `user_id` from the JWT, never a client-supplied id).

## Tech stack
- **Frontend:** React (Vite) + Tailwind CSS v4 + `react-router-dom` + `recharts`
- **Backend:** Flask (Python)
- **Database:** SQLAlchemy ORM + Flask-Migrate (Alembic) — SQLite by default, Postgres in production via `DATABASE_URL`
- **Auth:** Flask-JWT-Extended (JWT access tokens), `bcrypt` (password hashing), `google-auth` (server-side Google ID token verification), Google Identity Services (frontend sign-in button)
- **ML / XAI:** Custom ResNet-54 (`[3,5,6,3]` bottleneck config, ~23.3M parameters), Captum (`LayerGradCam`, `IntegratedGradients`)

> Note: this project uses **Tailwind CSS v4**, which is config-free — there is no `tailwind.config.js`. Design tokens (colors, fonts, animations) live directly in `src/index.css` inside an `@theme` block, wired in via the `@tailwindcss/vite` plugin in `vite.config.js`.

## Database schema

```
users                              predictions
├── id                 PK          ├── id                    PK
├── email               unique, not null, indexed
├── password_hash       nullable (null for Google-only accounts)
├── google_sub          unique, nullable, indexed
├── display_name        nullable
├── profile_picture_url nullable
├── auth_provider       "local" | "google" | "both"
├── is_active           default true
├── created_at
└── updated_at                     ├── user_id               FK → users.id, ON DELETE CASCADE, indexed
                                    ├── original_image_path
                                    ├── predicted_label       "Benign" | "Malignant"
                                    ├── confidence_score
                                    ├── gradcam_overlay_path
                                    ├── gradcam_heatmap_path
                                    ├── ig_overlay_path
                                    ├── ig_attribution_path
                                    └── created_at             indexed
```

`user.predictions` is a one-to-many relationship (`cascade="all, delete-orphan"` in the ORM, `ON DELETE CASCADE` at the DB level) — deleting a user deletes their prediction rows. Defined in `backend/models.py`; the committed migration in `backend/migrations/versions/` builds this schema on any fresh database.

## Authentication

Two ways to sign in, both issuing the same JWT:

1. **Email + password** — `POST /auth/register`, `POST /auth/login`. Passwords are hashed with `bcrypt`, never stored or logged in plaintext.
2. **Google OAuth (Sign in with Google)** — the frontend renders Google's own button via Google Identity Services, obtains an ID token client-side, and sends it to `POST /auth/google`, which verifies it server-side against `GOOGLE_CLIENT_ID` before issuing a JWT. If the Google email matches an existing local account, the two are linked (`auth_provider` becomes `"both"`) rather than creating a duplicate user.

Google sign-in is optional — if `GOOGLE_CLIENT_ID` / `VITE_GOOGLE_CLIENT_ID` aren't set, the button simply doesn't render and email/password auth works on its own.

## Project structure
```
tn54-frontend-/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   ├── UploadDropzone.jsx
│   │   ├── AuthField.jsx
│   │   ├── GoogleSignInButton.jsx
│   │   └── ProtectedRoute.jsx        # redirects to /login when signed out
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ArchitecturePage.jsx
│   │   ├── ResultsPage.jsx
│   │   ├── DashboardPage.jsx          # static, published test-set metrics
│   │   ├── LoginPage.jsx
│   │   ├── RegisterPage.jsx
│   │   └── HistoryPage.jsx            # signed-in user's past predictions
│   ├── lib/
│   │   ├── api.js                     # fetch wrappers (auth-aware)
│   │   └── auth-context.jsx           # AuthProvider / useAuth
│   ├── data/metrics.json
│   ├── App.jsx
│   └── index.css
└── package.json

backend/
├── app.py                 # Flask API: /predict, /predictions, /health
├── auth.py                 # Blueprint: /auth/register, /auth/login, /auth/google, /auth/me
├── models.py                # SQLAlchemy models: User, Prediction
├── config.py                 # env-driven Flask config (DB URI, JWT secret, Google client id)
├── extensions.py               # shared db / migrate / jwt instances
├── model.py                    # ResNet-54 architecture (ported from the training notebook)
├── preprocessing.py              # inference-time transform pipeline
├── xai.py                         # Captum Grad-CAM + Integrated Gradients
├── migrations/                     # Flask-Migrate/Alembic migration history
├── weights/                         # resnet54_v2_REGULARIZED_acc0.9182.pth (Git LFS)
├── storage/                          # gitignored — original + XAI images per prediction, at runtime
└── requirements.txt
```

## Getting started

### Prerequisites
- Node.js 18+
- Python 3.10+
- [Git LFS](https://git-lfs.com/) — the model weights file is stored via LFS. Run `git lfs install` once per machine, then clone/pull normally.

### Backend
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# fill in .env -- at minimum, generate a real JWT_SECRET_KEY:
#   python -c "import secrets; print(secrets.token_hex(32))"

flask db upgrade      # creates the local SQLite DB (or applies to DATABASE_URL if set)
python app.py
```
Runs at `http://localhost:5000`. The model weights ship in `backend/weights/` via Git LFS, so `/predict` works immediately — no separate download step needed.

### Frontend
```bash
npm install
cp .env.example .env
npm run dev
```
Runs at `http://localhost:5173`.

### Enabling Google sign-in (optional)
1. Create an OAuth 2.0 Client ID in the [Google Cloud Console](https://console.cloud.google.com/apis/credentials) (Web application type), with `http://localhost:5173` as an authorized JavaScript origin.
2. Set `GOOGLE_CLIENT_ID` in `backend/.env` and `VITE_GOOGLE_CLIENT_ID` in the root `.env` to the same client ID.
3. Restart both servers. The "Sign in with Google" button appears automatically once the frontend sees the env var.

### Using Postgres instead of SQLite
Set `DATABASE_URL` in `backend/.env` (e.g. `postgresql://user:password@localhost:5432/thyroscan`), then run `flask db upgrade` again to apply the same migration history to it.

## API reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Create an account (`email`, `password`) |
| POST | `/auth/login` | — | Log in with email/password |
| POST | `/auth/google` | — | Log in/register with a Google ID token (`id_token`) |
| GET | `/auth/me` | Bearer JWT | Current user's profile |
| POST | `/predict` | Bearer JWT | Upload an `image` file; returns prediction + Grad-CAM + Integrated Gradients (base64 PNGs), and persists the result |
| GET | `/predictions` | Bearer JWT | Caller's own prediction history (metadata only) |
| GET | `/health` | — | Liveness check |

## License
[Add license — MIT is common for academic/student projects]
