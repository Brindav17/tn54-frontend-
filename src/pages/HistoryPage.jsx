import { useEffect, useState } from "react";
import { fetchPredictions } from "../lib/api";

export default function HistoryPage() {
  const [predictions, setPredictions] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPredictions()
      .then(setPredictions)
      .catch((err) => setError(err.message || "Could not load prediction history."));
  }, []);

  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-cyan mb-2">HISTORY</p>
      <h1 className="font-display text-3xl font-medium mb-8">Your Predictions</h1>

      {error && (
        <p className="text-xs text-red-400 font-mono" role="alert">{error}</p>
      )}
      {!error && predictions === null && (
        <p className="text-sm text-muted font-mono">Loading…</p>
      )}
      {predictions?.length === 0 && (
        <p className="text-sm text-muted">No predictions yet — analyze an image to get started.</p>
      )}
      {predictions?.length > 0 && (
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-muted font-mono text-xs">
              <tr>
                <th className="text-left px-4 py-3">Prediction</th>
                <th className="text-right px-4 py-3">Confidence</th>
                <th className="text-right px-4 py-3">Date</th>
              </tr>
            </thead>
            <tbody>
              {predictions.map((p, i) => (
                <tr key={p.id} className={i % 2 === 0 ? "bg-panel" : "bg-panel/60"}>
                  <td
                    className={`px-4 py-3 font-medium ${
                      p.prediction === "Malignant" ? "text-coral" : "text-mint"
                    }`}
                  >
                    {p.prediction}
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">
                    {(p.confidence * 100).toFixed(1)}%
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-muted">
                    {new Date(p.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
