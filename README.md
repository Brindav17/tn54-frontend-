# TN-54 Ultrasound Nodule Classifier

Frontend + backend for our published research project: *"Ultrasound Thyroid Nodule Classification Using an Enhanced ResNet-54 Backbone with Dual Interpretability Methods."* The system classifies thyroid ultrasound nodule images as benign or malignant using a custom ResNet-54 model, and explains every prediction with Grad-CAM (region-level) and Integrated Gradients (pixel-level).

**Dataset:** TN5000 — 5,000 biopsy-verified thyroid ultrasound images

> **Scope note:** the model was trained on ROI-cropped nodule patches (cropped via ground-truth bounding boxes), not full raw ultrasound frames. There is no nodule-localization/detection model in this pipeline, so the live upload flow expects an already-cropped nodule image (see `TN5000_crops/test` for examples) rather than a full scan.

## Results at a glance (Regularized ResNet-54, TN5000 test set)
| Metric | Value |
|---|---|
| Validation Accuracy | 91.82% |
| Test Accuracy | 87.05% |
| F1-Score | 91.55% |
| Sensitivity | 96.04% |
| AUC-ROC | 90.19% |

## Tech stack
- **Frontend:** React (Vite) + Tailwind CSS v4 + `react-router-dom` + `recharts`
- **Backend:** Flask (Python) — serves the trained ResNet-54 model and generates Grad-CAM / Integrated Gradients overlays via Captum
- **Model:** Custom ResNet-54 (`[3,5,6,3]` bottleneck config), ~23.3M parameters

> Note: this project uses **Tailwind CSS v4**, which is config-free — there is no `tailwind.config.js`. Design tokens (colors, fonts, animations) live directly in `src/index.css` inside an `@theme` block, wired in via the `@tailwindcss/vite` plugin in `vite.config.js`.

## Project structure
```
tn54-frontend/
├── src/
│   ├── components/
│   │   ├── Layout.jsx
│   │   ├── Navbar.jsx
│   │   └── UploadDropzone.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx
│   │   ├── AboutPage.jsx
│   │   ├── ArchitecturePage.jsx
│   │   ├── ResultsPage.jsx
│   │   └── DashboardPage.jsx
│   ├── data/metrics.json        # static, published test-set metrics (Table 1 / Fig 7)
│   ├── lib/api.js                # POST /predict wrapper
│   ├── App.jsx
│   └── index.css
└── package.json

backend/
├── app.py            # Flask API (/predict, /health)
├── model.py           # ResNet-54 architecture (ported from the training notebook)
├── preprocessing.py    # inference-time transform pipeline
├── xai.py              # Captum Grad-CAM + Integrated Gradients
├── weights/            # place resnet54_v2_REGULARIZED_acc0.9182.pth here
└── requirements.txt
```

## Getting started

### Frontend
```bash
cd tn54-frontend
npm install
npm run dev
```
Runs at `http://localhost:5173`.

### Backend
```bash
cd backend
pip install -r requirements.txt
# place resnet54_v2_REGULARIZED_acc0.9182.pth in backend/weights/
python app.py
```
Runs at `http://localhost:5000`.

## License
[Add license — MIT is common for academic/student projects]
