const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export class PredictionError extends Error {}

export async function predict(file) {
  const formData = new FormData();
  formData.append("image", file);

  let response;
  try {
    response = await fetch(`${API_BASE_URL}/predict`, {
      method: "POST",
      body: formData,
    });
  } catch {
    throw new PredictionError(
      "Could not reach the backend. Is the Flask server running?"
    );
  }

  if (!response.ok) {
    let message = `Backend returned ${response.status}`;
    try {
      const body = await response.json();
      if (body?.error) message = body.error;
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new PredictionError(message);
  }

  return response.json();
}
