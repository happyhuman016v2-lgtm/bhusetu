/**
 * GovTech Authentication & RBAC API Client
 */

export interface AuthUser {
  email: string;
  full_name: string;
  role: 'CITIZEN' | 'REVENUE_OFFICER';
  badge_id?: string;
  designation: string;
  jurisdiction: string;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in_minutes: number;
  user: AuthUser;
}

const API_BASE = '/api';

export function getAuthToken(): string | null {
  return localStorage.getItem('bhusetu_access_token');
}

export function setAuthToken(token: string) {
  localStorage.setItem('bhusetu_access_token', token);
}

export function clearAuthToken() {
  localStorage.removeItem('bhusetu_access_token');
  localStorage.removeItem('bhusetu_user');
}

export function getStoredUser(): AuthUser | null {
  const raw = localStorage.getItem('bhusetu_user');
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export async function loginUser(email: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.detail || `Authentication failed with status ${res.status}`);
  }

  const data: LoginResponse = await res.json();
  setAuthToken(data.access_token);
  localStorage.setItem('bhusetu_user', JSON.stringify(data.user));
  return data;
}

export async function fetchCurrentUser(): Promise<AuthUser | null> {
  const token = getAuthToken();
  if (!token) return null;

  try {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return null;
    const user: AuthUser = await res.json();
    localStorage.setItem('bhusetu_user', JSON.stringify(user));
    return user;
  } catch {
    return null;
  }
}
