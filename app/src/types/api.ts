export interface ApiResponse<T> {
  data: T;
  success: boolean;
}

export interface ApiError {
  message: string;
  success: false;
}

export interface PageResponse<T> {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
}

export interface AuthResponse {
  token: string;
  expiresIn: number;
  userId: string;
  username: string;
}

// Perfil público — GET /api/users/{userId}
// Backend omits email via Jackson serialization-inclusion=non-null (includeEmail=false)
export interface PublicUserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  city?: string;
  interests?: string[];
  createdAt: string;
}

// Perfil do próprio usuário autenticado — GET /api/users/me, /api/auth/me
// email é sempre presente neste contexto
export interface UserProfile extends PublicUserProfile {
  email: string;
}

export interface EventResponse {
  id: string;
  creatorId: string;
  creatorUsername: string;
  title: string;
  description?: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  status: 'DRAFT' | 'PUBLISHED' | 'CANCELLED' | 'FINISHED';
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

export interface ParticipantResponse {
  userId: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  status: string;
  joinedAt: string;
}

// ── Events: create/update ──────────────────────────────────────────────

export interface CreateEventRequest {
  title: string;
  description?: string;
  category: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  latitude?: number;
  longitude?: number;
  locationName?: string;
  address?: string;
  startsAt: string;
  endsAt?: string;
  maxParticipants?: number;
}

export interface UpdateEventRequest {
  title?: string;
  description?: string;
  category?: string;
  visibility?: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  latitude?: number;
  longitude?: number;
  locationName?: string;
  address?: string;
  startsAt?: string;
  endsAt?: string;
  maxParticipants?: number;
}

// ── Social ────────────────────────────────────────────────────────────

export interface UserDto {
  id: string;
  email?: string;
  username: string;
  role: string;
  createdAt: string;
}

export interface FollowDto {
  id: string;
  follower: UserDto;
  following: UserDto;
  createdAt: string;
}
