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
