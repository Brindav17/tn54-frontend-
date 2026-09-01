import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../lib/auth-context";

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24 text-center text-muted font-mono text-sm">
        Loading…
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  return children;
}
