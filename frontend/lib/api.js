function getApiBase() {
  if (process.env.NEXT_PUBLIC_API_BASE) {
    return process.env.NEXT_PUBLIC_API_BASE;
  }
  if (typeof window !== "undefined") {
    const host = window.location.hostname || "localhost";
    return `http://${host}:8000/api/v1`;
  }
  return "http://127.0.0.1:8000/api/v1";
}

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

  const res = await fetch(`${getApiBase()}/auth/login`, {
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
  const res = await fetch(`${getApiBase()}/auth/register`, {
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
  if (filters.category && filters.category !== "All") params.append("category", filters.category);
  if (filters.bank_name && filters.bank_name !== "All Banks") params.append("bank_name", filters.bank_name);
  if (filters.month && filters.month !== "All Months") params.append("month", filters.month);
  if (filters.min_amount) params.append("min_amount", filters.min_amount);
  if (filters.query) params.append("query", filters.query);

  const url = `${getApiBase()}/transactions/?${params.toString()}`;
  const res = await fetch(url, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch transactions");
  return res.json();
}

export async function uploadStatement(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${getApiBase()}/transactions/upload`, {
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

export async function updateTransaction(id, updates) {
  const res = await fetch(`${getApiBase()}/transactions/${id}/category`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      ...getHeaders(),
    },
    body: JSON.stringify(updates),
  });
  if (!res.ok) throw new Error("Failed to update transaction");
  return res.json();
}

export async function updateTransactionCategory(id, category) {
  return updateTransaction(id, { category });
}

export async function getSummary() {
  const res = await fetch(`${getApiBase()}/insights/summary`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch summary metrics");
  return res.json();
}

export async function getForecast() {
  const res = await fetch(`${getApiBase()}/insights/forecast`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch forecast data");
  return res.json();
}

export async function getAlerts() {
  const res = await fetch(`${getApiBase()}/alerts/`, {
    headers: getHeaders(),
  });
  if (!res.ok) throw new Error("Failed to fetch alerts");
  return res.json();
}

export async function updateAlert(id, resolved) {
  const res = await fetch(`${getApiBase()}/alerts/${id}`, {
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
  const res = await fetch(`${getApiBase()}/agent/ask`, {
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
