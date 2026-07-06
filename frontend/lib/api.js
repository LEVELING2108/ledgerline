const API_BASE = "http://localhost:8080/api/v1";

// Helper to get auth headers
function getHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("ledgerline_token") : null;
  const headers = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export async function login(username, password) {
  const formData = new URLSearchParams();
  formData.append("username", username);
  formData.append("password", password);

  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Login failed" }));
    throw new Error(err.detail || "Login failed");
  }
  const data = await res.json();
  if (typeof window !== "undefined") {
    localStorage.setItem("ledgerline_token", data.access_token);
  }
  return data;
}

export async function register(email, name, password) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, name, password }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Registration failed" }));
    throw new Error(err.detail || "Registration failed");
  }
  return res.json();
}

export async function getTransactions(filters = {}) {
  const params = new URLSearchParams();
  if (filters.category) params.append("category", filters.category);
  if (filters.min_amount) params.append("min_amount", filters.min_amount);
  if (filters.query) params.append("query", filters.query);

  const url = `${API_BASE}/transactions/?${params.toString()}`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function uploadStatement(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE}/transactions/upload`, {
    method: "POST",
    headers: getHeaders(),
    body: formData,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Upload failed");
  }
  return res.json();
}

export async function updateTransactionCategory(id, category) {
  const res = await fetch(`${API_BASE}/transactions/${id}/category`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify({ category }),
  });
  if (!res.ok) throw new Error("Failed to update transaction category");
  return res.json();
}

export async function getSummary() {
  const res = await fetch(`${API_BASE}/insights/summary`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch summary metrics");
  return res.json();
}

export async function getForecast() {
  const res = await fetch(`${API_BASE}/insights/forecast`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch forecast data");
  return res.json();
}

export async function getAlerts() {
  const res = await fetch(`${API_BASE}/alerts/`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function updateAlert(id, resolved) {
  const res = await fetch(`${API_BASE}/alerts/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify({ resolved }),
  });
  if (!res.ok) throw new Error("Failed to update alert");
  return res.json();
}

export async function askAgent(question) {
  const res = await fetch(`${API_BASE}/agent/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify({ question }),
  });
  if (!res.ok) throw new Error("Failed to communicate with AI agent");
  return res.json();
}
