import React, { useState, useRef } from "react";

/**
 * Upload interface for an ultrasound scan.
 *
 * This component only handles getting an image from the user and previewing it.
 * It does NOT call the model. Pass an `onAnalyze(file)` prop from a parent route
 * (owned by the prediction/XAI module) to POST the file to the Flask backend
 * and navigate to the results view.
 */
export default function UploadDropzone({ onAnalyze }) {
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const inputRef = useRef(null);

  const handleFile = (f) => {
    if (!f) return;
    setFile(f);
    setPreviewUrl(URL.createObjectURL(f));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const clear = () => {
    setFile(null);
    setPreviewUrl(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleAnalyzeClick = async () => {
    if (!file) return;
    setAnalyzing(true);
    try {
      if (onAnalyze) {
        await onAnalyze(file);
      }
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <div id="analyze">
      <div
        onClick={() => inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragOver={(e) => e.preventDefault()}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`relative overflow-hidden rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[340px] cursor-pointer border-[1.5px] border-dashed bg-panel transition-colors
          ${dragOver ? "border-cyan bg-panel2" : "border-cyan/35"}`}
      >
        <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan to-transparent shadow-[0_0_12px_2px_rgba(94,225,230,0.6)] animate-sweep" />

        {!previewUrl ? (
          <div className="relative z-10">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full border border-cyan/40 flex items-center justify-center">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#5EE1E6" strokeWidth="1.6">
                <path d="M12 16V4M12 4l-4 4M12 4l4 4" />
                <path d="M4 16v3a2 2 0 002 2h12a2 2 0 002-2v-3" />
              </svg>
            </div>
            <p className="font-display text-base font-medium mb-1">Drop an ultrasound image</p>
            <p className="text-sm text-muted mb-5">or click to browse — JPG, PNG</p>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}
              className="font-mono text-xs px-4 py-2 rounded-lg bg-cyan text-ink font-semibold hover:opacity-90 transition"
            >
              Browse files
            </button>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
          </div>
        ) : (
          <div className="relative z-10 w-full">
            <img src={previewUrl} alt="Selected ultrasound scan" className="mx-auto rounded-lg max-h-48 object-contain mb-4 border border-white/10" />
            <p className="font-mono text-xs text-muted mb-4">{file?.name}</p>
            <div className="flex gap-3 justify-center">
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); handleAnalyzeClick(); }}
                disabled={analyzing}
                className="font-mono text-xs px-4 py-2 rounded-lg bg-cyan text-ink font-semibold hover:opacity-90 transition disabled:opacity-60"
              >
                {analyzing ? "Sending to model…" : "Run analysis"}
              </button>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); clear(); }}
                className="font-mono text-xs px-4 py-2 rounded-lg border border-white/15 text-muted hover:text-paper transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>
      <p className="text-xs text-muted font-mono mt-3 text-center">
        Analysis is handled by the classification module — this screen only prepares the image.
      </p>
    </div>
  );
}
