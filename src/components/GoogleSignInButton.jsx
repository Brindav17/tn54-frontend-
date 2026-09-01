import { useEffect, useRef } from "react";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

let scriptPromise = null;
function loadGoogleScript() {
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      if (window.google?.accounts?.id) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

// Renders Google's own "Sign in with Google" button and forwards the
// resulting ID token (a JWT, not an access token) to onCredential, which
// the caller sends to POST /auth/google for server-side verification.
export default function GoogleSignInButton({ onCredential }) {
  const buttonRef = useRef(null);

  useEffect(() => {
    if (!CLIENT_ID) return;
    let cancelled = false;

    loadGoogleScript().then(() => {
      if (cancelled || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: CLIENT_ID,
        callback: (response) => onCredential(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width: 320,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [onCredential]);

  if (!CLIENT_ID) {
    return (
      <p className="text-xs font-mono text-muted text-center">
        Google sign-in is not configured.
      </p>
    );
  }

  return <div ref={buttonRef} className="flex justify-center" />;
}
