import { type AuthResponse, type UserProfile } from '../types/api';
import { http, TOKEN_KEY } from './httpClient';

export async function register(
  email: string,
  username: string,
  password: string
): Promise<AuthResponse> {
  const auth = await http.post<AuthResponse>('/api/auth/register', {
    email,
    username,
    password,
  });
  localStorage.setItem(TOKEN_KEY, auth.token);
  return auth;
}

export async function login(email: string, password: string): Promise<AuthResponse> {
  const auth = await http.post<AuthResponse>('/api/auth/login', { email, password });
  localStorage.setItem(TOKEN_KEY, auth.token);
  return auth;
}

export async function me(): Promise<UserProfile> {
  return http.get<UserProfile>('/api/auth/me');
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
