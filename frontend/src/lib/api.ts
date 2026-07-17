const API_BASE_URL = "http://127.0.0.1:8080/api";

export async function fetchServers() {
  const response = await fetch(`${API_BASE_URL}/servers/`);
  if (!response.ok) throw new Error("Failed to fetch servers");
  return response.json();
}

export async function fetchServerDetail(serverId: number) {
  const response = await fetch(`${API_BASE_URL}/servers/${serverId}`);
  if (!response.ok) throw new Error("Failed to fetch server details");
  return response.json();
}

export async function triggerChaos(serverId: number, override: string | null) {
  const response = await fetch(`${API_BASE_URL}/servers/${serverId}/chaos`, {
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
  const response = await fetch(`${API_BASE_URL}/servers/${serverId}/containers/${containerId}/action`, {
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
