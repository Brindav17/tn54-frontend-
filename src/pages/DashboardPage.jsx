import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import metrics from "../data/metrics.json";

const { comparisonTable, confusionMatrix, headline } = metrics;

const barData = [
  { metric: "Test Acc.", Regularized: 87.05, Unregularized: 86.95 },
  { metric: "F1-Score", Regularized: 91.55, Unregularized: 91.11 },
  { metric: "Sensitivity", Regularized: 96.04, Unregularized: 92.22 },
  { metric: "AUC-ROC", Regularized: 90.19, Unregularized: 90.70 },
];

export default function DashboardPage() {
  return (
    <div className="max-w-5xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-cyan mb-2">ANALYTICS</p>
      <h1 className="font-display text-3xl font-medium mb-2">Model Performance</h1>
      <p className="text-muted mb-10 max-w-2xl">
        Reported results for the Regularized ResNet-54 model on the TN5000 held-out test
        set (1,004 images), from the published paper.
      </p>

      {/* HEADLINE STATS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-14">
        <StatCard label="Val. Accuracy" value={`${(headline.valAccuracy * 100).toFixed(2)}%`} />
        <StatCard label="F1-Score" value={`${(headline.f1Score * 100).toFixed(2)}%`} />
        <StatCard label="Sensitivity" value={`${(headline.sensitivity * 100).toFixed(2)}%`} />
        <StatCard label="AUC-ROC" value={`${(headline.aucRoc * 100).toFixed(2)}%`} />
      </div>

      {/* CONFUSION MATRIX */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-medium mb-4">Confusion Matrix (Test Set)</h2>
        <ConfusionMatrix data={confusionMatrix} />
      </section>

      {/* REGULARIZED VS UNREGULARIZED CHART */}
      <section className="mb-14">
        <h2 className="font-display text-xl font-medium mb-4">Regularized vs. Unregularized</h2>
        <div className="border border-white/5 rounded-xl bg-panel p-4 h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
              <XAxis dataKey="metric" stroke="#8b93a7" fontSize={12} />
              <YAxis domain={[80, 100]} stroke="#8b93a7" fontSize={12} unit="%" />
              <Tooltip
                contentStyle={{ background: "#12151c", border: "1px solid #ffffff1a", fontSize: 12 }}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Bar dataKey="Regularized" fill="#5EE1E6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Unregularized" fill="#FF7A6B" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      {/* COMPARISON TABLE */}
      <section>
        <h2 className="font-display text-xl font-medium mb-4">Full Comparison (Table 1)</h2>
        <div className="border border-white/5 rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-panel2 text-muted font-mono text-xs">
              <tr>
                <th className="text-left px-4 py-3">Metric</th>
                <th className="text-right px-4 py-3">Regularized</th>
                <th className="text-right px-4 py-3">Unregularized</th>
                <th className="text-right px-4 py-3">Difference</th>
              </tr>
            </thead>
            <tbody>
              {comparisonTable.map((row, i) => (
                <tr key={row.metric} className={i % 2 === 0 ? "bg-panel" : "bg-panel/60"}>
                  <td className="px-4 py-3 text-paper">{row.metric}</td>
                  <td className="px-4 py-3 text-right font-mono text-cyan">{row.regularized}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{row.unregularized}</td>
                  <td className="px-4 py-3 text-right font-mono text-muted">{row.difference}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function StatCard({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-xl px-4 py-5 text-center">
      <div className="font-display text-2xl font-medium text-paper">{value}</div>
      <div className="text-muted text-xs font-mono mt-1">{label}</div>
    </div>
  );
}

function ConfusionMatrix({ data }) {
  const [[tn, fp], [fn, tp]] = data.matrix;
  const max = Math.max(tn, fp, fn, tp);
  const cellStyle = (count) => ({
    backgroundColor: `rgba(94, 225, 230, ${0.15 + 0.55 * (count / max)})`,
  });

  return (
    <div className="max-w-md">
      <div className="grid grid-cols-[auto_1fr_1fr] gap-1 font-mono text-sm">
        <div />
        <div className="text-center text-xs text-muted pb-2">Predicted Benign</div>
        <div className="text-center text-xs text-muted pb-2">Predicted Malignant</div>

        <div className="text-xs text-muted flex items-center pr-2">True Benign</div>
        <Cell style={cellStyle(tn)} count={tn} total={data.totalTestSamples} />
        <Cell style={cellStyle(fp)} count={fp} total={data.totalTestSamples} />

        <div className="text-xs text-muted flex items-center pr-2">True Malignant</div>
        <Cell style={cellStyle(fn)} count={fn} total={data.totalTestSamples} />
        <Cell style={cellStyle(tp)} count={tp} total={data.totalTestSamples} />
      </div>
    </div>
  );
}

function Cell({ style, count, total }) {
  return (
    <div style={style} className="rounded-lg p-4 text-center border border-white/10">
      <div className="text-paper text-lg font-medium">{count}</div>
      <div className="text-muted text-xs">{((count / total) * 100).toFixed(1)}%</div>
    </div>
  );
}
