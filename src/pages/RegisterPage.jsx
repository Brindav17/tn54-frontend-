import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth-context";
import GoogleSignInButton from "../components/GoogleSignInButton";
import AuthField from "../components/AuthField";

export default function RegisterPage() {
  const { register, loginWithGoogle } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }

    setSubmitting(true);
    try {
      await register(email, password);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Could not create account.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleCredential = async (idToken) => {
    setError(null);
    try {
      await loginWithGoogle(idToken);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Google sign-in failed.");
    }
  };

  return (
    <div className="max-w-sm mx-auto px-6 py-20">
      <p className="font-mono text-xs text-cyan mb-2">GET STARTED</p>
      <h1 className="font-display text-3xl font-medium mb-8">Create an account</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <AuthField label="Email" type="email" value={email} onChange={setEmail} autoComplete="email" required />
        <AuthField
          label="Password"
          type="password"
          value={password}
          onChange={setPassword}
          autoComplete="new-password"
          minLength={8}
          required
        />
        <AuthField
          label="Confirm password"
          type="password"
          value={confirmPassword}
          onChange={setConfirmPassword}
          autoComplete="new-password"
          minLength={8}
          required
        />
        {error && (
          <p className="text-xs text-red-400 font-mono" role="alert">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="w-full font-mono text-xs px-4 py-3 rounded-lg bg-cyan text-ink font-medium hover:opacity-90 transition disabled:opacity-60"
        >
          {submitting ? "Creating account…" : "Create account"}
        </button>
      </form>

      <Divider />
      <GoogleSignInButton onCredential={handleGoogleCredential} />

      <p className="text-sm text-muted mt-8 text-center">
        Already have an account?{" "}
        <Link to="/login" className="text-cyan hover:underline">Log in</Link>
      </p>
    </div>
  );
}

function Divider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <span className="h-px flex-1 bg-white/10" />
      <span className="text-xs font-mono text-muted">or</span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}
