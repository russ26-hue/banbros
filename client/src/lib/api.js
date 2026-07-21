const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

/**
 * Core fetch wrapper. Automatically:
 * - Prefixes the API base URL
 * - Sets JSON headers (unless sending FormData, e.g. file uploads)
 * - Attaches the auth token from localStorage, if present (client-side only)
 * - Throws a normalized Error with the server's message on failure
 */
async function apiFetch(path, options = {}) {
  const isFormData = options.body instanceof FormData;

  const headers = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  // Only attempt localStorage access in the browser, not during server-side rendering
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("banbros_token");
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });

  let data = null;
  try {
    data = await res.json();
  } catch {
    // some endpoints (like a 204) may not return a body
  }

  if (!res.ok) {
    const message = data?.error || `Request failed with status ${res.status}`;
    const error = new Error(message);
    error.status = res.status;
    throw error;
  }

  return data;
}

export const api = {
  get: (path) => apiFetch(path, { method: "GET" }),
  post: (path, body) =>
    apiFetch(path, {
      method: "POST",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  put: (path, body) =>
    apiFetch(path, {
      method: "PUT",
      body: body instanceof FormData ? body : JSON.stringify(body),
    }),
  patch: (path, body) =>
    apiFetch(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => apiFetch(path, { method: "DELETE" }),
};
