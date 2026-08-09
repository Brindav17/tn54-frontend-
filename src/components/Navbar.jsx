import React from "react";

// Shared top navigation. Links point to routes the other modules will own:
// /            -> Landing (this module)
// /analyze     -> scrolls to the upload section on landing
// /about       -> Member 2's model/dataset info page
// /dashboard   -> Member 4's metrics dashboard
export default function Navbar() {
  return (
    <header className="border-b border-white/5 sticky top-0 z-30 backdrop-blur bg-ink/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-lg font-semibold tracking-tight">
            TN<span className="text-cyan">·54</span>
          </span>
          <span className="hidden sm:inline text-xs font-mono text-muted ml-2">
            ultrasound nodule classifier
          </span>
        </div>
        <nav className="flex items-center gap-6 text-sm">
          <a href="/" className="text-muted hover:text-paper transition-colors">Home</a>
          <a href="#analyze" className="text-muted hover:text-paper transition-colors">Analyze</a>
          <a href="/about" className="text-muted hover:text-paper transition-colors">About the Model</a>
          <a href="/dashboard" className="text-muted hover:text-paper transition-colors">Results Dashboard</a>
        </nav>
      </div>
    </header>
  );
}
