import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

// Shared top navigation.
// /            -> Landing
// /analyze     -> scrolls to the upload section on landing
// /about       -> dataset/architecture info
// /dashboard   -> metrics dashboard
// /history     -> signed-in user's past predictions
export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <header className="border-b border-white/5 sticky top-0 z-30 backdrop-blur bg-ink/80">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="font-display text-lg font-medium tracking-tight">
            TN<span className="text-cyan">-54</span>
          </span>
          <span className="hidden sm:inline text-xs font-mono text-muted ml-2">
            ultrasound nodule classifier
          </span>
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link to="/" className="text-muted hover:text-paper transition-colors">Home</Link>
          <Link to="/#analyze" className="text-muted hover:text-paper transition-colors">Analyze</Link>
          <Link to="/about" className="text-muted hover:text-paper transition-colors">About the Model</Link>
          <Link to="/dashboard" className="text-muted hover:text-paper transition-colors">Results Dashboard</Link>
          {user && (
            <Link to="/history" className="text-muted hover:text-paper transition-colors">History</Link>
          )}
          {user ? (
            <div className="flex items-center gap-3">
              <span className="hidden md:inline text-xs font-mono text-muted">
                {user.display_name || user.email}
              </span>
              <button
                type="button"
                onClick={handleLogout}
                className="font-mono text-xs px-3 py-1.5 rounded-lg border border-white/15 text-muted hover:text-paper transition"
              >
                Log out
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="font-mono text-xs px-3 py-1.5 rounded-lg bg-cyan text-ink font-medium hover:opacity-90 transition"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
