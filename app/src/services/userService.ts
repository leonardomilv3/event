import { type UserProfile, type PublicUserProfile, type PageResponse, type EventResponse } from '../types/api';
import { http } from './httpClient';

export interface UpdateProfileRequest {
  displayName?: string;
  bio?: string;
  city?: string;
  interests?: string[];
}

export async function getMe(): Promise<UserProfile> {
  return http.get<UserProfile>('/api/users/me');
}

export async function updateMe(data: UpdateProfileRequest): Promise<UserProfile> {
  return http.put<UserProfile>('/api/users/me', data);
}

export async function getPublicProfile(userId: string): Promise<PublicUserProfile> {
  return http.get<PublicUserProfile>(`/api/users/${userId}`);
}

export async function getMyEvents(page = 0, size = 20): Promise<PageResponse<EventResponse>> {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return http.get<PageResponse<EventResponse>>(`/api/users/me/events?${q}`);
}
