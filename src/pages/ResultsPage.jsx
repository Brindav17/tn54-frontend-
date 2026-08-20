import { useState } from "react";
import { useLocation, Navigate, Link } from "react-router-dom";

export default function ResultsPage() {
  const location = useLocation();
  const [tab, setTab] = useState("gradcam");

  const { result, previewUrl } = location.state || {};

  // No result in router state means the user landed here directly
  // (e.g. refresh or manual URL) — there is no fake placeholder to show.
  if (!result) {
    return <Navigate to="/" replace />;
  }

  const isMalignant = result.prediction === "Malignant";
  const confidencePct = (result.confidence * 100).toFixed(1);

  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-cyan mb-2">RESULTS</p>
      <h1 className="font-display text-3xl font-medium mb-8">Prediction & Explainability</h1>

      <div className="grid md:grid-cols-[280px_1fr] gap-8 mb-12">
        {/* Original image + verdict */}
        <div>
          {previewUrl && (
            <img
              src={previewUrl}
              alt="Uploaded ultrasound scan"
              className="w-full rounded-xl border border-white/10 mb-4 object-contain bg-panel"
            />
          )}
          <div
            className={`rounded-xl border p-4 ${
              isMalignant ? "border-coral/40 bg-coral/5" : "border-mint/40 bg-mint/5"
            }`}
          >
            <p className="text-xs font-mono text-muted mb-1">PREDICTION</p>
            <p className={`font-display text-2xl font-medium ${isMalignant ? "text-coral" : "text-mint"}`}>
              {result.prediction}
            </p>
            <p className="text-sm text-muted mt-1">{confidencePct}% confidence</p>
          </div>
        </div>

        {/* XAI toggle */}
        <div>
          <div className="flex gap-2 mb-4">
            <TabButton active={tab === "gradcam"} onClick={() => setTab("gradcam")}>
              Grad-CAM (region-level)
            </TabButton>
            <TabButton active={tab === "ig"} onClick={() => setTab("ig")}>
              Integrated Gradients (pixel-level)
            </TabButton>
          </div>

          {tab === "gradcam" ? (
            <XaiPanel
              overlaySrc={`data:image/png;base64,${result.gradcam.overlay_png}`}
              mapSrc={`data:image/png;base64,${result.gradcam.heatmap_png}`}
              overlayLabel="Grad-CAM Overlay"
              mapLabel="Grad-CAM Heatmap"
            />
          ) : (
            <XaiPanel
              overlaySrc={`data:image/png;base64,${result.integrated_gradients.overlay_png}`}
              mapSrc={`data:image/png;base64,${result.integrated_gradients.attribution_png}`}
              overlayLabel="Integrated Gradients Overlay"
              mapLabel="IG Attribution Map"
            />
          )}
        </div>
      </div>

      <Link to="/" className="text-xs font-mono text-cyan hover:underline">
        &larr; Analyze another image
      </Link>
    </div>
  );
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`font-mono text-xs px-4 py-2 rounded-lg border transition ${
        active
          ? "bg-cyan text-ink border-cyan font-medium"
          : "border-white/15 text-muted hover:text-paper"
      }`}
    >
      {children}
    </button>
  );
}

function XaiPanel({ overlaySrc, mapSrc, overlayLabel, mapLabel }) {
  return (
    <div className="grid sm:grid-cols-2 gap-4">
      <figure className="border border-white/5 rounded-xl bg-panel p-3">
        <img src={overlaySrc} alt={overlayLabel} className="w-full rounded-lg" />
        <figcaption className="text-xs font-mono text-muted mt-2 text-center">{overlayLabel}</figcaption>
      </figure>
      <figure className="border border-white/5 rounded-xl bg-panel p-3">
        <img src={mapSrc} alt={mapLabel} className="w-full rounded-lg" />
        <figcaption className="text-xs font-mono text-muted mt-2 text-center">{mapLabel}</figcaption>
      </figure>
    </div>
  );
}
