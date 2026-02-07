// API client for connecting to the Node.js/Express backend
// Uses environment variable for the API base URL

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Helper to get stored JWT token
export function getToken(): string | null {
  return localStorage.getItem("jv_token");
}

// Helper to set stored JWT token
export function setToken(token: string): void {
  localStorage.setItem("jv_token", token);
}

// Helper to remove stored JWT token
export function removeToken(): void {
  localStorage.removeItem("jv_token");
}

// Helper to get stored user data
export function getStoredUser(): ApiUser | null {
  const data = localStorage.getItem("jv_user");
  if (!data) return null;
  try {
    return JSON.parse(data);
  } catch {
    return null;
  }
}

// Helper to set stored user data
export function setStoredUser(user: ApiUser): void {
  localStorage.setItem("jv_user", JSON.stringify(user));
}

// Helper to remove stored user data
export function removeStoredUser(): void {
  localStorage.removeItem("jv_user");
}

// Types
export interface ApiUser {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string;
}

export interface AuthResponse {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  token: string;
}

export interface VerificationResult {
  id: string;
  advert_text: string | null;
  advert_link: string | null;
  source_platform: string | null;
  recruiter_email: string | null;
  recruiter_phone: string | null;
  risk_score: number;
  verdict: string;
  indicators: string[];
  user_id: string | null;
  saved: boolean;
  created_at: string;
}

export interface DashboardData {
  verifications: {
    id: string;
    verdict: string;
    risk_score: number;
    created_at: string;
    advert_text: string | null;
  }[];
  reports: {
    id: string;
    report_type: string;
    status: string;
    created_at: string;
  }[];
  stats: {
    totalVerifications: number;
    scamsDetected: number;
    reportsSubmitted: number;
  };
}

// Generic fetch helper
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Request failed");
  }

  return data as T;
}

// ========== AUTH API ==========

export async function apiRegister(
  name: string,
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ name, email, password }),
  });
  setToken(data.token);
  setStoredUser(data);
  return data;
}

export async function apiLogin(
  email: string,
  password: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  setToken(data.token);
  setStoredUser(data);
  return data;
}

export async function apiAdminLogin(
  adminCode: string
): Promise<AuthResponse> {
  const data = await apiFetch<AuthResponse>("/api/auth/admin-login", {
    method: "POST",
    body: JSON.stringify({ adminCode }),
  });
  setToken(data.token);
  setStoredUser(data);
  return data;
}

export async function apiGetCurrentUser(): Promise<ApiUser | null> {
  try {
    return await apiFetch<ApiUser>("/api/auth/me");
  } catch {
    return null;
  }
}

export function apiLogout(): void {
  removeToken();
  removeStoredUser();
}

// ========== VERIFY API ==========

export async function apiVerify(body: {
  advertText: string | null;
  advertLink: string | null;
  sourcePlatform: string;
  recruiterEmail: string;
  recruiterPhone: string;
  userId: string | null;
}): Promise<{ id: string; riskScore: number; verdict: string; indicators: string[] }> {
  return apiFetch("/api/verify", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export async function apiGetVerification(id: string): Promise<VerificationResult> {
  return apiFetch<VerificationResult>(`/api/verify/${id}`);
}

export async function apiSaveVerification(id: string): Promise<void> {
  await apiFetch(`/api/verify/${id}/save`, { method: "PUT" });
}

// ========== DASHBOARD API ==========

export async function apiGetDashboard(): Promise<DashboardData> {
  return apiFetch<DashboardData>("/api/dashboard");
}

// ========== REPORTS API ==========

export async function apiSubmitReport(body: {
  verificationId: string;
  reportType: "scam" | "suspicious";
  userId: string | null;
  message: string | null;
}): Promise<void> {
  await apiFetch("/api/reports", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

// ========== ADMIN API ==========

export async function apiGetAdminReports(): Promise<any[]> {
  return apiFetch("/api/admin/reports");
}

export async function apiResolveReport(id: string): Promise<void> {
  await apiFetch(`/api/admin/reports/${id}/resolve`, { method: "PUT" });
}

export async function apiGetAdminVerifications(): Promise<any[]> {
  return apiFetch("/api/admin/verifications");
}

export async function apiGetBlacklist(): Promise<any[]> {
  return apiFetch("/api/admin/blacklist");
}

export async function apiAddToBlacklist(type: string, value: string): Promise<void> {
  await apiFetch("/api/admin/blacklist", {
    method: "POST",
    body: JSON.stringify({ type, value }),
  });
}

export async function apiDeleteBlacklist(id: string): Promise<void> {
  await apiFetch(`/api/admin/blacklist/${id}`, { method: "DELETE" });
}
