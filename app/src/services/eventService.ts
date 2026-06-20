import { type EventResponse, type PageResponse, type ParticipantResponse, type CreateEventRequest, type UpdateEventRequest } from '../types/api';
import { http } from './httpClient';

export async function getFeed(
  lat: number,
  lon: number,
  page = 0,
  size = 20
): Promise<PageResponse<EventResponse>> {
  const q = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    page: String(page),
    size: String(size),
  });
  return http.get<PageResponse<EventResponse>>(`/api/events/feed?${q}`);
}

export async function getNearby(
  lat: number,
  lon: number,
  radius = 10,
  page = 0,
  size = 20
): Promise<PageResponse<EventResponse>> {
  const q = new URLSearchParams({
    lat: String(lat),
    lon: String(lon),
    radius: String(radius),
    page: String(page),
    size: String(size),
  });
  return http.get<PageResponse<EventResponse>>(`/api/events/nearby?${q}`);
}

export async function getById(id: string): Promise<EventResponse> {
  return http.get<EventResponse>(`/api/events/${id}`);
}

export async function getParticipants(
  eventId: string,
  page = 0,
  size = 20
): Promise<PageResponse<ParticipantResponse>> {
  const q = new URLSearchParams({ page: String(page), size: String(size) });
  return http.get<PageResponse<ParticipantResponse>>(
    `/api/events/${eventId}/participants?${q}`
  );
}

export async function createEvent(data: CreateEventRequest): Promise<EventResponse> {
  return http.post<EventResponse>('/api/events', data);
}

export async function updateEvent(id: string, data: UpdateEventRequest): Promise<EventResponse> {
  return http.put<EventResponse>(`/api/events/${id}`, data);
}

export async function deleteEvent(id: string): Promise<void> {
  await http.delete<void>(`/api/events/${id}`);
}

export async function publishEvent(id: string): Promise<EventResponse> {
  return http.post<EventResponse>(`/api/events/${id}/publish`);
}
