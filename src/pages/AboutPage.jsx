import { Link } from "react-router-dom";

const PIPELINE_STEPS = [
  { n: "01", title: "Parse XML annotations", desc: "5,013 Pascal VOC XML annotation files are parsed to extract bounding box coordinates (xmin, ymin, xmax, ymax), class label (0=Benign, 1=Malignant), and image dimensions into a consolidated CSV." },
  { n: "02", title: "Assign train / val / test split", desc: "Each image is mapped to its official TN5000 split — 70% train, 10% validation, 20% test." },
  { n: "03", title: "Validate bounding boxes", desc: "Boxes are checked against actual image dimensions and clamped to the valid image region where they don't align." },
  { n: "04", title: "Crop the region of interest", desc: "The nodule ROI is cropped from the original image using the bounding box." },
  { n: "05", title: "Resize & normalize", desc: "The crop is resized to 224×224 and normalized using ImageNet mean/std statistics, matching standard ImageNet preprocessing." },
];

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <p className="font-mono text-xs text-cyan mb-2">ABOUT THE PROJECT</p>
      <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight mb-6">
        TN-54 Ultrasound Nodule Classifier
      </h1>
      <p className="text-muted leading-relaxed mb-12 max-w-3xl">
        Thyroid cancer is the most common malignancy of the endocrine system, and around
        42 million people in India suffer from thyroid disorders. This project presents an
        automated, explainable AI framework for classifying thyroid nodules from ultrasound
        images as benign or malignant, using a custom mid-depth ResNet-54 backbone trained
        on the TN5000 dataset, with predictions explained via Grad-CAM and Integrated Gradients.
      </p>

      {/* DATASET */}
      <section className="mb-16">
        <h2 className="font-display text-xl font-medium mb-4">Dataset — TN5000</h2>
        <p className="text-muted leading-relaxed mb-6">
          TN5000 consists of 5,000 biopsy-verified thyroid ultrasound images. Every image
          carries a Pascal VOC XML bounding-box annotation locating the nodule and labeling
          it Class 0 (Benign) or Class 1 (Malignant).
        </p>
        <div className="grid grid-cols-3 gap-4 font-mono text-sm">
          <SplitStat label="Train" value="3,508" pct="70%" />
          <SplitStat label="Validation" value="501" pct="10%" />
          <SplitStat label="Test" value="1,004" pct="20%" />
        </div>
      </section>

      {/* PREPROCESSING */}
      <section className="mb-16">
        <h2 className="font-display text-xl font-medium mb-4">Preprocessing Pipeline</h2>
        <div className="space-y-3">
          {PIPELINE_STEPS.map((s) => (
            <div key={s.n} className="flex gap-4 border border-white/5 rounded-xl p-4 bg-panel">
              <div className="font-mono text-sm w-8 h-8 shrink-0 rounded-lg border border-cyan/35 text-cyan flex items-center justify-center">
                {s.n}
              </div>
              <div>
                <h3 className="font-display text-sm font-medium mb-1">{s.title}</h3>
                <p className="text-sm text-muted leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-muted font-mono mt-4">
          Note: this demo's live upload flow expects an image that has already been through
          step 04 (a pre-cropped nodule ROI) — see the Home page for details.
        </p>
      </section>

      {/* ARCHITECTURE SUMMARY */}
      <section>
        <h2 className="font-display text-xl font-medium mb-4">The Custom ResNet-54 Backbone</h2>
        <p className="text-muted leading-relaxed mb-6">
          Development began from a standard ResNet-50 and added one residual block at a time —
          each a sequence of convolutional, batch-normalization, and ReLU layers — to reach a
          custom mid-depth architecture with a bottleneck configuration of <span className="font-mono text-cyan">[3, 5, 6, 3]</span>,
          54 convolutional layers, and roughly 23.3M parameters. ResNet-54 was chosen over the
          other depths tested because it produced the best sensitivity (96.04%) for
          distinguishing malignant nodules.
        </p>
        <Link to="/architecture" className="text-xs font-mono text-cyan hover:underline">
          See the full stage-by-stage architecture breakdown &rarr;
        </Link>
      </section>
    </div>
  );
}

function SplitStat({ label, value, pct }) {
  return (
    <div className="border border-white/10 bg-white/[0.02] rounded-lg px-4 py-3 text-center">
      <div className="text-paper text-lg font-medium">{value}</div>
      <div className="text-muted text-xs">{label} · {pct}</div>
    </div>
  );
}
