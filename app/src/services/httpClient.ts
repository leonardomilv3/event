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

export async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError('Sem conexão com o servidor');
  }

  if (res.status === 401) {
    localStorage.removeItem(TOKEN_KEY);
    window.location.href = '/login';
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
  get: <T>(path: string) => apiRequest<T>(path),
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
