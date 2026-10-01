import { buildAuthPath } from '../utils/redirect';

export const TOKEN_KEY = 'eventing_token';

interface RawApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
  errors?: string[];
  errorCode?: string;
}

export class ApiError extends Error {
  readonly success = false as const;
  readonly errors?: string[];
  readonly code?: string;

  constructor(message: string, errors?: string[], code?: string) {
    super(message);
    this.name = 'ApiError';
    this.errors = errors;
    this.code = code;
  }
}

export interface RequestBehavior {
  /** false: 401 só lança ApiError, sem redirecionar (ex.: bootstrap de sessão em página pública). */
  redirectOnUnauthorized?: boolean;
}

async function send(path: string, options: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    return await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor');
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  { redirectOnUnauthorized = true }: RequestBehavior = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  let res = await send(path, options, token);

  if (res.status === 401 && token) {
    // Token expirado também é rejeitado em endpoints públicos; repetir anônimo
    // evita mandar para o login quem abriu um link compartilhado com sessão vencida.
    localStorage.removeItem(TOKEN_KEY);
    res = await send(path, options, null);
  }

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    if (redirectOnUnauthorized && !window.location.pathname.startsWith('/login')) {
      window.location.href = buildAuthPath(window.location.pathname + window.location.search);
    }
    throw new ApiError('Sessão expirada');
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  let body: RawApiResponse<T>;
  try {
    body = (await res.json()) as RawApiResponse<T>;
  } catch {
    throw new ApiError(`Erro HTTP ${res.status}`);
  }

  if (!body.success) {
    throw new ApiError(body.message ?? 'Erro desconhecido', body.errors, body.errorCode);
  }

  return body.data as T;
}

export const http = {
  get: <T>(path: string, behavior?: RequestBehavior) => apiRequest<T>(path, {}, behavior),
  post: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'POST',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  put: <T>(path: string, body?: unknown) =>
    apiRequest<T>(path, {
      method: 'PUT',
      body: body !== undefined ? JSON.stringify(body) : undefined,
    }),
  delete: <T>(path: string) => apiRequest<T>(path, { method: 'DELETE' }),
};
