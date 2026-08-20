const STAGES = [
  { name: "INPUT", detail: "224 × 224 × 3 RGB Image (ImageNet Normalized)" },
  { name: "CONV 1", detail: "112 × 112 × 64 — 7×7 Conv, s=2 + BatchNorm + ReLU + MaxPool(3×3, s=2)" },
  { name: "STAGE 1", detail: "56 × 56 × 256 — 3× Bottleneck [1×1, 3×3, 1×1], Conv s=1 + BN + ReLU" },
  { name: "STAGE 2", detail: "28 × 28 × 512 — 5× Bottleneck [1×1, 3×3, 1×1], Conv s=2→1 + BN + ReLU" },
  { name: "STAGE 3", detail: "14 × 14 × 1024 — 6× Bottleneck [1×1, 3×3, 1×1], Conv s=2→1 + BN + ReLU" },
  { name: "STAGE 4", detail: "7 × 7 × 2048 — 3× Bottleneck [1×1, 3×3, 1×1], Conv s=2→1 + BN + ReLU" },
  { name: "POOL + DROP", detail: "1 × 1 × 2048 — GlobalAvgPool(7×7 → 1×1) + Dropout(p=0.4) (regularization)" },
  { name: "FULLY CONNECTED", detail: "2048 → 2 Linear (no activation)" },
  { name: "OUTPUT", detail: "Softmax(2) class probabilities — 1: Benign, 2: Malignant" },
];

export default function ArchitecturePage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-cyan mb-2">MODEL ARCHITECTURE</p>
      <h1 className="font-display text-3xl md:text-4xl font-medium mb-6">
        Enhanced ResNet-54 Backbone
      </h1>
      <p className="text-muted leading-relaxed mb-10 max-w-3xl">
        The backbone is a custom mid-depth ResNet, chosen for its higher sensitivity (96.04%)
        and ability to extract minute, detailed features useful for precise nodule
        classification. Development began from ResNet-50, adding one residual block at a time
        to reach ResNet-54 — where each residual block is a sequence of convolutional,
        batch-normalization, and ReLU layers.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-sm mb-12">
        <SpecStat label="Bottleneck config" value="[3, 5, 6, 3]" />
        <SpecStat label="Conv layers" value="54" />
        <SpecStat label="Parameters" value="23.3M" />
        <SpecStat label="Dropout" value="0.4" />
      </div>

      <section className="mb-16">
        <h2 className="font-display text-xl font-medium mb-4">Stage-by-stage breakdown</h2>
        <div className="space-y-3">
          {STAGES.map((s) => (
            <div key={s.name} className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 border border-white/5 rounded-xl p-4 bg-panel">
              <div className="font-mono text-xs text-cyan w-40 shrink-0">{s.name}</div>
              <div className="text-sm text-muted">{s.detail}</div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted font-mono mt-4">
          The bottleneck configuration [3,5,6,3] means 3 blocks in stage 1, 5 in stage 2, 6 in
          stage 3, and 3 in stage 4 — each block consisting of 1×1, 3×3, 1×1 convolutions
          followed by batch normalization and ReLU.
        </p>
      </section>

      <section className="mb-16">
        <h2 className="font-display text-xl font-medium mb-4">Training configuration</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-sm">
          <SpecStat label="Optimizer" value="AdamW" />
          <SpecStat label="Weight decay" value="3×10⁻⁴" />
          <SpecStat label="Label smoothing" value="0.1" />
          <SpecStat label="Best epoch" value="9 / 25" />
        </div>
      </section>

      <section>
        <h2 className="font-display text-xl font-medium mb-4">Novel contributions</h2>
        <ul className="list-disc list-inside space-y-2 text-sm text-muted leading-relaxed">
          <li>ResNet-54 with bottleneck configuration [3, 5, 6, 3]</li>
          <li>Six-technique regularization strategy to reduce the Val–Test generalization gap</li>
          <li>Dual explainability — Grad-CAM (region-level) and Integrated Gradients (pixel-level)</li>
        </ul>
      </section>
    </div>
  );
}

function SpecStat({ label, value }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-lg px-3 py-2">
      <div className="text-paper text-sm font-medium">{value}</div>
      <div className="text-muted text-xs">{label}</div>
    </div>
  );
}
