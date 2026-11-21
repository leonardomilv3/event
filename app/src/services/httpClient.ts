import i18n from '../lib/i18n'
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

/** Resolves the current i18n language; used for both Accept-Language and local fallbacks. */
function currentLanguage(): string {
  return i18n.resolvedLanguage ?? i18n.language ?? 'en'
}

function t(key: string, opts?: Record<string, unknown>): string {
  // `i18n.t` tipado com CustomTypeOptions exige chaves literais do namespace;
  // o `as never` bypassa isso porque este helper existe exatamente para
  // aceitar chaves dinâmicas. Seguro em runtime: chaves faltantes viram
  // `missingKey` do i18next (a própria string), não crash.
  return i18n.t(key as never, { ns: 'common', ...opts }) as string
}

async function send(path: string, options: RequestInit, token: string | null): Promise<Response> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'Accept-Language': currentLanguage(),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  try {
    return await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(t('errors.network'));
  }
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  { redirectOnUnauthorized = true }: RequestBehavior = {},
): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const wasAuthenticated = token !== null;
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
    // Authenticated request that still 401s after the anonymous retry = session expired.
    // Anonymous request (e.g. login with wrong password) = let the backend's 401 message through.
    if (wasAuthenticated) {
      throw new ApiError(t('errors.sessionExpired'));
    }
  }

  if (res.status === 204) {
    return undefined as unknown as T;
  }

  let body: RawApiResponse<T>;
  try {
    body = (await res.json()) as RawApiResponse<T>;
  } catch {
    throw new ApiError(t('errors.httpError', { status: res.status }));
  }

  if (!body.success) {
    throw new ApiError(
      body.message ?? t('errors.generic'),
      body.errors,
      body.errorCode,
    );
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