const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export class PredictionError extends Error {}
export class AuthError extends Error {}

let authToken = null;

export function setAuthToken(token) {
  authToken = token;
}

async function errorMessage(response, fallback) {
  try {
    const body = await response.json();
    if (body?.error) return body.error;
  } catch {
    // response wasn't JSON, keep default message
  }
  return fallback;
}

export async function predict(file) {
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      headers: authToken ? { Authorization: `Bearer ${authToken}` } : {},
      body: formData,
    });
  } catch {
    throw new PredictionError(
      "Could not reach the backend. Is the Flask server running?"
    );
  }

  if (!response.ok) {
    throw new PredictionError(await errorMessage(response, `Backend returned ${response.status}`));
  }

  return response.json();
}

async function authRequest(path, { method = "POST", body, auth = false } = {}) {
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: {
        ...(body ? { "Content-Type": "application/json" } : {}),
        ...(auth && authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new AuthError("Could not reach the backend. Is the Flask server running?");
  }

  if (!response.ok) {
    throw new AuthError(await errorMessage(response, `Backend returned ${response.status}`));
  }

  return response.json();
}

export const registerUser = ({ email, password }) =>
  authRequest("/auth/register", { body: { email, password } });

export const loginUser = ({ email, password }) =>
  authRequest("/auth/login", { body: { email, password } });

export const loginWithGoogle = (idToken) =>
  authRequest("/auth/google", { body: { id_token: idToken } });

export const fetchMe = () => authRequest("/auth/me", { method: "GET", auth: true });

export const fetchPredictions = () => authRequest("/predictions", { method: "GET", auth: true });
