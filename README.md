<<<<<<< HEAD
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
=======
# TN·54 — Ultrasound Thyroid Nodule Classification

Frontend + backend for our published research project: *"Ultrasound Thyroid Nodule Classification Using an Enhanced ResNet-54 Backbone with Dual Interpretability Methods."* The system classifies thyroid ultrasound scans as benign or malignant using a custom ResNet-54 model, and explains every prediction with Grad-CAM (region-level) and Integrated Gradients (pixel-level).

**Paper:** [add link/DOI once available]
**Dataset:** TN5000 — 5,000 biopsy-verified thyroid ultrasound images

## Results at a glance
| Metric | Value |
|---|---|
| Validation Accuracy | 91.82% |
| F1-Score | 87.05% |
| Sensitivity | 96.04% |
| AUC-ROC | 90.19% |

## Tech stack
- **Frontend:** React.js (Vite) + Tailwind CSS v4
- **Backend:** Flask (Python) — serves the trained ResNet-54 model and generates Grad-CAM / Integrated Gradients overlays
- **Model:** Custom ResNet-54 ([3,5,6,3] bottleneck config), 23.3M parameters

> Note: this project uses **Tailwind CSS v4**, which is config-free — there is no `tailwind.config.js`. Design tokens (colors, fonts, animations) live directly in `src/index.css` inside an `@theme` block. Tailwind is wired in via the `@tailwindcss/vite` plugin in `vite.config.js`.

## Project structure
```
tn54-frontend/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx
│   │   └── UploadDropzone.jsx
│   ├── pages/
│   │   ├── LandingPage.jsx      
│   │   ├── AboutPage.jsx        
│   │   ├── ResultsPage.jsx      
│   │   └── DashboardPage.jsx    
│   ├── App.jsx
│   └── index.css
├── tailwind.config.js
└── package.json

backend/
├── app.py                       # Flask API
├── model/                       # trained weights, inference code
└── requirements.txt
```

## Team & module ownership
| Member | Module |
|---|---|
| Brinda Vishwanath | Landing page & upload interface |
| Member 2 | About / dataset / model architecture pages |
| Member 3 | Prediction results & dual XAI (Grad-CAM + Integrated Gradients) |
| Member 4 | Analytics dashboard, ROC/confusion matrix, Flask backend & deployment |

## Getting started

### Frontend
```bash
git clone https://github.com/<your-username>/tn54-frontend.git
cd tn54-frontend
npm install
npm install -D @tailwindcss/vite
npm run dev
```
Runs at `http://localhost:5173`.

### Backend
```bash
cd backend
pip install -r requirements.txt
python app.py
```

## Contributing (for team members)
1. Pull the latest `main` before starting: `git pull origin main`
2. Create a branch for your module: `git checkout -b feature/<your-module-name>`
3. Commit with clear messages: `git commit -m "Add upload dropzone component"`
4. Push your branch: `git push origin feature/<your-module-name>`
5. Open a Pull Request into `main` and tag a teammate to review before merging.

## License
[Add license — MIT is common for academic/student projects]

## Citation
If you use this work, please cite our paper:
> Vishwanath, B., et al. "Ultrasound Thyroid Nodule Classification Using an Enhanced ResNet-54 Backbone with Dual Interpretability Methods." [venue, year]
>>>>>>> 68127b84e0db3d4b3c99b18a9d3e5b545b38f87f
