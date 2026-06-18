import { http } from './httpClient';

export async function join(eventId: string): Promise<void> {
  await http.post<void>(`/api/events/${eventId}/join`);
}

export async function leave(eventId: string): Promise<void> {
  await http.delete<void>(`/api/events/${eventId}/leave`);
}
