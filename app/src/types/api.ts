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

export interface UserProfile {
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
