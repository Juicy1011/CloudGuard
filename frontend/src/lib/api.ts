export function getApiBaseUrl(): string {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    return `http://${host}:8080/api`;
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

export async function createServer(serverData: any) {
  const response = await fetch(`${getApiBaseUrl()}/servers/`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(serverData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to enroll server");
  }
  return response.json();
}

export async function deleteServer(serverId: number) {
  const response = await fetch(`${getApiBaseUrl()}/servers/${serverId}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete server");
  }
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

export async function loginUser(credentials: any) {
  const response = await fetch(`${getApiBaseUrl()}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Invalid credentials");
  }
  return response.json();
}

export async function registerUser(userData: any) {
  const response = await fetch(`${getApiBaseUrl()}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Registration failed");
  }
  return response.json();
}

export async function requestPasswordReset(email: string) {
  const response = await fetch(`${getApiBaseUrl()}/auth/forgot-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to send reset code");
  }
  return response.json();
}

export async function confirmPasswordReset(data: any) {
  const response = await fetch(`${getApiBaseUrl()}/auth/reset-password`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to reset password");
  }
  return response.json();
}

export async function fetchNotificationEmails() {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails`);
  if (!response.ok) throw new Error("Failed to fetch alert recipient emails");
  return response.json();
}

export async function addNotificationEmail(email: string) {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email }),
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to add email recipient");
  }
  return response.json();
}

export async function deleteNotificationEmail(identifier: string | number) {
  const response = await fetch(`${getApiBaseUrl()}/settings/emails/${encodeURIComponent(String(identifier))}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to delete email recipient");
  }
  return response.json();
}
