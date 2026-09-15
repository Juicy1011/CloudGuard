export interface UserSession {
  id?: number;
  username: string;
  email: string;
  role?: string;
  access_token?: string;
  is_protected?: boolean;
}

const STORAGE_KEY = "cloudguard_user";

export function setStoredUser(user: UserSession, rememberMe: boolean): void {
  const json = JSON.stringify(user);
  if (typeof window !== "undefined") {
    clearStoredUser();
    if (rememberMe) {
      localStorage.setItem(STORAGE_KEY, json);
    } else {
      sessionStorage.setItem(STORAGE_KEY, json);
    }
  }
}

export function getStoredUser(): UserSession | null {
  if (typeof window === "undefined") return null;

  try {
    const local = localStorage.getItem(STORAGE_KEY);
    if (local) return JSON.parse(local);

    const session = sessionStorage.getItem(STORAGE_KEY);
    if (session) return JSON.parse(session);
  } catch (e) {
    console.error("Failed to parse stored user session:", e);
  }

  return null;
}

export function clearStoredUser(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
  }
}
