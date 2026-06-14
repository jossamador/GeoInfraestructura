export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: string;
};

export type LocationRecord = {
  _id: string;
  name: string;
  description: string;
  longitude: number;
  latitude: number;
  createdBy?: { name: string; email: string };
};

export type ReportRecord = {
  _id: string;
  title: string;
  description: string;
  severity: "low" | "medium" | "high" | "critical";
  category: string;
  status: string;
  location: LocationRecord;
  reporter: AuthUser;
};

export type InfrastructureRecord = {
  _id: string;
  name: string;
  category: string;
  condition: string;
  description: string;
  owner: string;
  location: LocationRecord;
};

export type ZoneRecord = {
  _id: string;
  name: string;
  description: string;
  points: Array<{ lat: number; lng: number }>;
};

const API_BASE = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:4000/api";

const tokenKey = "geo_lluvias_token";

export const getToken = () => localStorage.getItem(tokenKey);
export const setToken = (token: string) => localStorage.setItem(tokenKey, token);
export const clearToken = () => localStorage.removeItem(tokenKey);

const request = async <T>(path: string, init: RequestInit = {}, secure = true) => {
  const headers = new Headers(init.headers);
  headers.set("Content-Type", "application/json");

  if (secure) {
    const token = getToken();
    if (token) {
      headers.set("Authorization", `Bearer ${token}`);
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...init,
    headers
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message ?? "Error de red");
  }

  return payload as T;
};

export const api = {
  register: (data: { name: string; email: string; password: string }) => request<{ token: string; user: AuthUser; ok: boolean }>("/auth/register", { method: "POST", body: JSON.stringify(data) }, false),
  login: (data: { email: string; password: string }) => request<{ token: string; user: AuthUser; ok: boolean }>("/auth/login", { method: "POST", body: JSON.stringify(data) }, false),
  me: () => request<{ profile: AuthUser; ok: boolean }>("/auth/me"),
  listLocations: () => request<{ locations: LocationRecord[]; ok: boolean }>("/locations"),
  searchLocation: (name: string) => request<{ location: LocationRecord; ok: boolean }>(`/locations/search/${encodeURIComponent(name)}`),
  createLocation: (data: { name: string; description: string; longitude: number; latitude: number }) => request<{ location: LocationRecord; ok: boolean }>("/locations", { method: "POST", body: JSON.stringify(data) }),
  updateLocation: (id: string, data: Partial<{ name: string; description: string; longitude: number; latitude: number }>) => request<{ location: LocationRecord; ok: boolean }>(`/locations/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteLocation: (id: string) => request<{ location: LocationRecord; ok: boolean }>(`/locations/${id}`, { method: "DELETE" }),
  listReports: () => request<{ reports: ReportRecord[]; ok: boolean }>("/reports"),
  createReport: (data: { title: string; description: string; severity: ReportRecord["severity"]; category: string; location: string }) => request<{ report: ReportRecord; ok: boolean }>("/reports", { method: "POST", body: JSON.stringify(data) }),
  updateReport: (id: string, data: Partial<{ title: string; description: string; severity: ReportRecord["severity"]; category: string; location: string }>) => request<{ report: ReportRecord; ok: boolean }>(`/reports/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteReport: (id: string) => request<{ report: ReportRecord; ok: boolean }>(`/reports/${id}`, { method: "DELETE" }),
  listInfrastructures: () => request<{ infrastructures: InfrastructureRecord[]; ok: boolean }>("/infrastructures"),
  createInfrastructure: (data: { name: string; category: string; condition: string; description: string; location: string; owner?: string }) => request<{ infrastructure: InfrastructureRecord; ok: boolean }>("/infrastructures", { method: "POST", body: JSON.stringify(data) }),
  updateInfrastructure: (id: string, data: Partial<{ name: string; category: string; condition: string; description: string; location: string; owner?: string }>) => request<{ infrastructure: InfrastructureRecord; ok: boolean }>(`/infrastructures/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteInfrastructure: (id: string) => request<{ infrastructure: InfrastructureRecord; ok: boolean }>(`/infrastructures/${id}`, { method: "DELETE" }),
  listZones: () => request<{ zones: ZoneRecord[]; ok: boolean }>("/zones"),
  createZone: (data: { name: string; description: string; points: Array<{ lat: number; lng: number }> }) => request<{ zone: ZoneRecord; ok: boolean }>("/zones", { method: "POST", body: JSON.stringify(data) }),
  deleteZone: (id: string) => request<{ zone: ZoneRecord; ok: boolean }>(`/zones/${id}`, { method: "DELETE" })
};
