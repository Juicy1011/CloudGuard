function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const hostname = window.location.hostname;
    return `http://${hostname}:8080/api`;
  }
  return "http://127.0.0.1:8080/api";
}

export async function fetchServers() {
  const response = await fetch(`${getApiBaseUrl()}/servers/`);
  if (!response.ok) throw new Error("Failed to fetch servers");
  return response.json();
}

export async function fetchServerDetail(serverId: number) {
  const response = await fetch(`${getApiBaseUrl()}/servers/${serverId}`);
  if (!response.ok) throw new Error("Failed to fetch server details");
  return response.json();
}

export async function triggerChaos(serverId: number, override: string | null) {
  const response = await fetch(`${getApiBaseUrl()}/servers/${serverId}/chaos`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ override }),
  });
  if (!response.ok) throw new Error("Failed to set chaos override");
  return response.json();
}

export async function manageContainer(serverId: number, containerId: string, action: "stop" | "start" | "restart") {
  const response = await fetch(`${getApiBaseUrl()}/servers/${serverId}/containers/${containerId}/action`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ action }),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || `Failed to ${action} container`);
  }
  return response.json();
}

export async function createServer(serverData: {
  name: string;
  hostname: string;
  port: number;
  username: string;
  password?: string;
  private_key?: string;
}) {
  const response = await fetch(`${getApiBaseUrl()}/servers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serverData),
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to create server");
  }
  return response.json();
}

export async function deleteServer(serverId: number) {
  const response = await fetch(`${getApiBaseUrl()}/servers/${serverId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.detail || "Failed to delete server");
  }
  return;
}

export async function loginUser(email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid credentials");
  }
  return response.json();
}

export async function registerUser(username: string, email: string, password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, email, password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to register user");
  }
  return response.json();
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to request password reset");
  }
  return response.json();
}

export async function confirmPasswordReset(email: string, otp: string, new_password: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, otp, new_password }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }
  return response.json();
}

export async function fetchNotificationEmails() {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails`);
  if (!response.ok) throw new Error("Failed to fetch notification emails");
  return response.json();
}

export async function addNotificationEmail(email: string) {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add notification email");
  }
  return response.json();
}

export async function deleteNotificationEmail(email: string) {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails/${encodeURIComponent(email)}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete notification email");
  }
  return response.json();
}


