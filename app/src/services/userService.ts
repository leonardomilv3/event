import { type UserProfile } from '../types/api';
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
