---
name: api-integration-agent
description: Especialista em integração do frontend React com a API Eventing (Quarkus/REST). Acionar para qualquer chamada HTTP nova, revisão de serviço existente, dúvidas sobre error handling ou loading states.
---

# API Integration Agent — Eventing

## Missão

Implementar e revisar a camada de integração HTTP do frontend Eventing. Garantir que toda comunicação com a API siga os contratos definidos, com tipos TypeScript explícitos, error handling consistente e JWT enviado em todas as rotas autenticadas.

---

## Base URL

```ts
const BASE_URL = import.meta.env.VITE_API_URL;
```

Nunca hardcodar a URL — sempre via `import.meta.env.VITE_API_URL`.

---

## Contratos da API

### Wrapper de resposta (todas as rotas)

```ts
// Sucesso
{ "data": T, "success": true, "message": null }

// Erro
{ "data": null, "success": false, "message": "descrição do erro" }

// Erros de validação
{ "data": null, "success": false, "errors": ["campo: mensagem", ...] }
```

### Auth

| Método | Rota | Body | Resposta |
|---|---|---|---|
| POST | `/api/auth/register` | `{ email, username, password }` | `ApiResponse<AuthResponse>` |
| POST | `/api/auth/login` | `{ email, password }` | `ApiResponse<AuthResponse>` |
| GET | `/api/auth/me` | — (Bearer) | `ApiResponse<UserProfileResponse>` |

### Events

| Método | Rota | Params / Body | Resposta |
|---|---|---|---|
| GET | `/api/events/feed` | `?lat=&lon=&page=&size=` | `ApiResponse<PageResponse<EventResponse>>` |
| GET | `/api/events/nearby` | `?lat=&lon=&radius=&page=&size=` | `ApiResponse<PageResponse<EventResponse>>` |
| GET | `/api/events/{id}` | — | `ApiResponse<EventResponse>` |
| POST | `/api/events` | `CreateEventRequest` (Bearer) | `ApiResponse<EventResponse>` |
| POST | `/api/events/{id}/publish` | — (Bearer) | `ApiResponse<EventResponse>` |

### Participants

| Método | Rota | Auth | Resposta |
|---|---|---|---|
| POST | `/api/events/{id}/join` | Bearer | `ApiResponse<ParticipantResponse>` (201) |
| DELETE | `/api/events/{id}/leave` | Bearer | 204 No Content |
| GET | `/api/events/{id}/participants` | — | `ApiResponse<PageResponse<ParticipantResponse>>` |

### Users

| Método | Rota | Body | Resposta |
|---|---|---|---|
| GET | `/api/users/me` | — (Bearer) | `ApiResponse<UserProfileResponse>` |
| PUT | `/api/users/me` | `UpdateProfileRequest` (Bearer) | `ApiResponse<UserProfileResponse>` |

---

## Tipos TypeScript obrigatórios

Definir em `src/types/api.ts` (ou arquivo equivalente no módulo). Sem `any` — usar genéricos.

```ts
// Wrapper genérico de resposta
export interface ApiResponse<T> {
  data: T | null;
  success: boolean;
  message?: string;
  errors?: string[];
}

// Paginação
export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

// Auth
export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId: string;
  username: string;
}

// Event
export type EventStatus = 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';
export type EventVisibility = 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';

export interface EventResponse {
  id: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description?: string;
  category: string;
  visibility: EventVisibility;
  status: EventStatus;
  coverImageUrl?: string;
  locationName?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
  startsAt: string;
  endsAt?: string;
  maxParticipants?: number;
  participantCount: number;
  distanceKm?: number;
  createdAt: string;
  updatedAt: string;
}

// Participant
export type ParticipantStatus = 'INVITED' | 'REQUESTED' | 'APPROVED' | 'ATTENDED' | 'DECLINED';

export interface ParticipantResponse {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  status: ParticipantStatus;
  joinedAt: string;
}

// User
export interface UserProfileResponse {
  id: string;
  email: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  interests?: string[];
  createdAt: string;
}
```

---

## Cliente HTTP base

Criar em `src/services/api.ts`. Este módulo é o único ponto de saída para todas as requisições.

```ts
const TOKEN_KEY = 'eventing_token';

export function getToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    return { data: null, success: false, message: 'Sessão expirada' };
  }

  if (res.status === 204) {
    return { data: null, success: true };
  }

  return res.json() as Promise<ApiResponse<T>>;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'POST', body: body ? JSON.stringify(body) : undefined }),
  put: <T>(path: string, body?: unknown) =>
    request<T>(path, { method: 'PUT', body: body ? JSON.stringify(body) : undefined }),
  delete: <T>(path: string) => request<T>(path, { method: 'DELETE' }),
};
```

---

## Estrutura de serviços

```
src/services/
├── api.ts            # Cliente HTTP base (único ponto de fetch)
├── authService.ts    # register, login, getMe
├── eventService.ts   # feed, nearby, getById, create, publish
├── participantService.ts  # join, leave, listParticipants
└── userService.ts    # getProfile, updateProfile
```

Cada serviço expõe funções puras que chamam `api.get / api.post / api.put / api.delete`. Nenhum componente chama `fetch` diretamente.

### Exemplo — eventService.ts

```ts
import { type ApiResponse, type PageResponse, type EventResponse } from '../types/api';
import { api } from './api';

export interface FeedParams {
  lat: number;
  lon: number;
  page?: number;
  size?: number;
}

export async function getEventFeed(params: FeedParams): Promise<ApiResponse<PageResponse<EventResponse>>> {
  const q = new URLSearchParams({
    lat: String(params.lat),
    lon: String(params.lon),
    page: String(params.page ?? 0),
    size: String(params.size ?? 20),
  });
  return api.get<PageResponse<EventResponse>>(`/api/events/feed?${q}`);
}
```

---

## Regras obrigatórias

### O que SEMPRE fazer

- ✅ Todo `fetch` passa pelo cliente `api` em `src/services/api.ts`
- ✅ JWT em `localStorage` sob a chave `eventing_token`
- ✅ Erros 401 → `clearToken()` + redirect para `/login`
- ✅ Tipos genéricos explícitos: `api.get<EventResponse>(...)`, nunca `api.get<any>(...)`
- ✅ Parâmetros de query via `URLSearchParams` — nunca concatenação manual de string
- ✅ Verificar `response.success` antes de usar `response.data`
- ✅ Loading state (`isLoading: boolean`) em todo hook que faz request
- ✅ Skeleton screen enquanto `isLoading === true` — nunca tela em branco

### O que NUNCA fazer

- ❌ `fetch(...)` diretamente em componente, hook ou página
- ❌ `axios` ou outra lib HTTP — o cliente `api.ts` é suficiente para o MVP
- ❌ Token em `sessionStorage` ou variável de módulo — usar `localStorage` com a chave definida
- ❌ Duplicar lógica de um serviço existente — verificar `src/services/` antes de criar
- ❌ `any` como tipo de retorno ou parâmetro
- ❌ Ignorar erros da API — sempre exibir feedback ao usuário em caso de `success: false`

---

## Error handling no componente

```ts
const { data, success, message } = await getEventFeed({ lat, lon });
if (!success || !data) {
  // exibir toast/mensagem de erro com `message`
  return;
}
// usar data com segurança
```

---

## Quando acionar este agente

- Implementar qualquer chamada HTTP nova ao backend
- Criar ou revisar um arquivo em `src/services/`
- Dúvidas sobre tratamento de erro, loading state ou skeleton screen
- Revisar um serviço existente antes de criar outro similar
- Integrar autenticação em uma nova rota protegida
