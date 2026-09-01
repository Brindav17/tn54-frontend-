import { useState } from "react";
import { useNavigate } from "react-router-dom";
import UploadDropzone from "../components/UploadDropzone";
import { predict, PredictionError } from "../lib/api";
import { useAuth } from "../lib/auth-context";

export default function LandingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [error, setError] = useState(null);

  const handleAnalyze = async (file) => {
    setError(null);
    if (!user) {
      navigate("/login", { state: { from: "/" } });
      return;
    }
    try {
      const result = await predict(file);
      navigate("/results", { state: { result, previewUrl: URL.createObjectURL(file) } });
    } catch (err) {
      setError(err instanceof PredictionError ? err.message : "Something went wrong analyzing this image.");
    }
  };

  return (
    <div>
      {/* HERO */}
      <section className="grid-bg border-b border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-16 md:py-24 grid md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-flex items-center gap-2 border border-white/10 bg-white/[0.02] rounded-full px-3 py-1 text-xs font-mono text-cyan mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-mint animate-pulse-slow" />
              ULTRASOUND · AI-ASSISTED · EXPLAINABLE
            </div>
            <h1 className="font-display text-4xl md:text-5xl font-medium leading-[1.1] mb-5">
              Upload a scan.
              <br />
              Get a reading — <span className="text-cyan">and see why.</span>
            </h1>
            <p className="text-muted text-base md:text-lg leading-relaxed mb-8 max-w-md">
              A ResNet-54 backbone trained on 5,000 biopsy-verified thyroid ultrasound
              images, classifying nodules as benign or malignant — with every prediction
              traced back to the pixels that drove it.
            </p>
            <div className="flex flex-wrap gap-3 font-mono text-xs">
              <Stat value="91.82%" label="val. accuracy" />
              <Stat value="96.04%" label="sensitivity" />
              <Stat value="Grad-CAM + IG" label="dual explainability" />
            </div>
          </div>

          <div>
            <UploadDropzone onAnalyze={handleAnalyze} />
            <p className="text-xs text-amber-300/80 font-mono mt-3">
              Note: this demo expects an already-cropped nodule ROI image (like the samples
              in TN5000's test crops), not a full raw ultrasound frame — the model was trained
              on cropped nodule patches.
            </p>
            {error && (
              <p className="text-xs text-red-400 font-mono mt-2" role="alert">{error}</p>
            )}
          </div>
        </div>
      </section>

      {/* PIPELINE */}
      <section className="max-w-6xl mx-auto px-6 py-16">
        <p className="font-mono text-xs text-cyan mb-2">HOW IT WORKS</p>
        <h2 className="font-display text-2xl font-medium mb-10">
          From image to interpretable diagnosis, in three passes.
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          <Step n="01" title="Upload & preprocess" desc="A cropped nodule ROI image is resized to 224×224 and normalized to match ImageNet preprocessing standards." />
          <Step n="02" title="Classify" desc="A regularized ResNet-54 backbone predicts benign or malignant with a confidence score." />
          <Step n="03" title="Explain" desc="Grad-CAM highlights the region driving the decision; Integrated Gradients attributes it down to the pixel." />
        </div>
      </section>

      <footer className="border-t border-white/5">
        <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row justify-between gap-2 text-xs font-mono text-muted">
          <span>TN-54 — Ultrasound Nodule Classifier, RV University</span>
          <span>TN5000 dataset · ResNet-54 · Grad-CAM · Integrated Gradients</span>
        </div>
      </footer>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-lg px-3 py-2">
      <div className="text-paper text-sm font-medium">{value}</div>
      <div className="text-muted">{label}</div>
    </div>
  );
}

function Step({ n, title, desc }) {
  return (
    <div className="border border-white/5 rounded-xl p-6 bg-panel">
      <div className="font-mono text-sm w-8 h-8 rounded-lg border border-cyan/35 text-cyan flex items-center justify-center mb-4">
        {n}
      </div>
      <h3 className="font-display font-medium mb-2">{title}</h3>
      <p className="text-sm text-muted leading-relaxed">{desc}</p>
    </div>
  );
}
