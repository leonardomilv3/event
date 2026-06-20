import { type FollowDto } from '../types/api';
import { http } from './httpClient';

export async function getFollowers(userId: string): Promise<FollowDto[]> {
  return http.get<FollowDto[]>(`/api/social/users/${userId}/followers`);
}

export async function getFollowing(userId: string): Promise<FollowDto[]> {
  return http.get<FollowDto[]>(`/api/social/users/${userId}/following`);
}

export async function follow(userId: string): Promise<FollowDto> {
  return http.post<FollowDto>(`/api/social/users/${userId}/follow`);
}

export async function unfollow(userId: string): Promise<void> {
  await http.delete<void>(`/api/social/users/${userId}/follow`);
}
