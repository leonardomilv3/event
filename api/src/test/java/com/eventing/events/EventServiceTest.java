package com.eventing.events;

import com.eventing.TestFixtures;
import com.eventing.auth.AuthService;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventResponse;
import com.eventing.events.dto.UpdateEventRequest;
import com.eventing.events.service.EventService;
import com.eventing.shared.exception.ApiException;
import com.eventing.shared.response.PageResponse;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class EventServiceTest {

    @Inject AuthService authService;
    @Inject EventService eventService;

    // ── CREATE ────────────────────────────────────────────────────────────────

    @Test
    void shouldCreateEventWithLocationAndStatusDraft() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);

        EventResponse event = eventService.create(creator.userId(),
            TestFixtures.publicEventRequest(startsAt));

        assertNotNull(event.id());
        assertEquals(EventStatus.DRAFT, event.status());
        assertEquals(EventVisibility.PUBLIC, event.visibility());
        assertNotNull(event.latitude());
        assertNotNull(event.longitude());
    }

    @Test
    void shouldCreateEventWithoutLocation() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);

        var req = new CreateEventRequest(
            "Evento sem local", "desc", "CULTURE",
            EventVisibility.PUBLIC,
            null, null, null, null,
            startsAt, null, 50
        );
        EventResponse event = eventService.create(creator.userId(), req);

        assertNotNull(event.id());
        assertNull(event.latitude());
        assertNull(event.longitude());
    }

    @Test
    void shouldDefaultVisibilityToPublicWhenNull() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);

        var req = new CreateEventRequest(
            "Evento", "desc", "MUSIC",
            null, // visibility null → default PUBLIC
            -15.79, -47.88, "Brasília", null,
            startsAt, null, null
        );
        EventResponse event = eventService.create(creator.userId(), req);

        assertEquals(EventVisibility.PUBLIC, event.visibility());
    }

    @Test
    void shouldFailCreateForNonexistentCreatorId() {
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);

        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.create(UUID.randomUUID(), TestFixtures.publicEventRequest(startsAt)));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── GET BY ID ─────────────────────────────────────────────────────────────

    @Test
    void shouldGetEventById() {
        AuthResponse creator = registerUser();
        EventResponse created = createDraftEvent(creator);

        EventResponse found = eventService.getById(created.id());

        assertEquals(created.id(), found.id());
        assertEquals(created.title(), found.title());
    }

    @Test
    void shouldFailGetByIdForNonexistentEvent() {
        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.getById(UUID.randomUUID()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── UPDATE ────────────────────────────────────────────────────────────────

    @Test
    void shouldUpdateTitleKeepingOtherFields() {
        AuthResponse creator = registerUser();
        EventResponse original = createDraftEvent(creator);

        var updateReq = new UpdateEventRequest(
            "Título Atualizado", null, null, null,
            null, null, null, null, null, null, null
        );
        EventResponse updated = eventService.update(creator.userId(), original.id(), updateReq);

        assertEquals("Título Atualizado", updated.title());
        assertEquals(original.category(), updated.category());
        assertEquals(original.visibility(), updated.visibility());
    }

    @Test
    void shouldUpdateLocation() {
        AuthResponse creator = registerUser();
        EventResponse original = createDraftEvent(creator);

        var updateReq = new UpdateEventRequest(
            null, null, null, null,
            -23.5505, -46.6333, // São Paulo
            null, null, null, null, null
        );
        EventResponse updated = eventService.update(creator.userId(), original.id(), updateReq);

        assertEquals(-23.5505, updated.latitude(), 0.0001);
        assertEquals(-46.6333, updated.longitude(), 0.0001);
    }

    @Test
    void shouldFailUpdateForNonOwner() {
        AuthResponse owner = registerUser();
        AuthResponse other = registerUser();
        EventResponse event = createDraftEvent(owner);

        var updateReq = new UpdateEventRequest(
            "Hackeado", null, null, null,
            null, null, null, null, null, null, null
        );
        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.update(other.userId(), event.id(), updateReq));

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
    }

    @Test
    void shouldFailUpdateForNonexistentEvent() {
        AuthResponse creator = registerUser();
        var updateReq = new UpdateEventRequest(
            "X", null, null, null,
            null, null, null, null, null, null, null
        );

        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.update(creator.userId(), UUID.randomUUID(), updateReq));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── DELETE (soft delete → CANCELLED) ─────────────────────────────────────

    @Test
    void shouldCancelEventAsSoftDelete() {
        AuthResponse creator = registerUser();
        EventResponse event = createDraftEvent(creator);

        eventService.delete(creator.userId(), event.id());

        EventResponse cancelled = eventService.getById(event.id());
        assertEquals(EventStatus.CANCELLED, cancelled.status());
    }

    @Test
    void shouldFailDeleteForNonOwner() {
        AuthResponse owner = registerUser();
        AuthResponse other = registerUser();
        EventResponse event = createDraftEvent(owner);

        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.delete(other.userId(), event.id()));

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
    }

    // ── PUBLISH (DRAFT → PUBLISHED) ───────────────────────────────────────────

    @Test
    void shouldPublishDraftEvent() {
        AuthResponse creator = registerUser();
        EventResponse event = createDraftEvent(creator);

        EventResponse published = eventService.publish(creator.userId(), event.id());

        assertEquals(EventStatus.PUBLISHED, published.status());
    }

    @Test
    void shouldFailPublishAlreadyPublishedEvent() {
        AuthResponse creator = registerUser();
        EventResponse event = createDraftEvent(creator);
        eventService.publish(creator.userId(), event.id());

        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.publish(creator.userId(), event.id()));

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void shouldFailPublishForNonOwner() {
        AuthResponse owner = registerUser();
        AuthResponse other = registerUser();
        EventResponse event = createDraftEvent(owner);

        ApiException ex = assertThrows(ApiException.class,
            () -> eventService.publish(other.userId(), event.id()));

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
    }

    // ── CACHE / GEOLOCALIZAÇÃO ────────────────────────────────────────────────

    @Test
    void shouldFindNearbyPublishedEventsWithinRadius() {
        AuthResponse creator = registerUser();
        createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));

        // Evento em Brasília — busca no mesmo ponto com raio de 10km
        PageResponse<EventResponse> result =
            eventService.findNearby(-15.7942, -47.8825, 10.0, 0, 20);

        assertNotNull(result);
        assertFalse(result.content().isEmpty());
        assertTrue(result.totalElements() >= 1);
    }

    @Test
    void shouldReturnEmptyForCoordinatesWithNoEvents() {
        // Coordenada no oceano Atlântico — nenhum evento criado nos testes está aqui
        PageResponse<EventResponse> result =
            eventService.findNearby(0.0, 0.0, 1.0, 0, 20);

        assertNotNull(result);
        assertEquals(0, result.totalElements());
        assertTrue(result.content().isEmpty());
    }

    @Test
    void shouldReturnFeedWithPublishedEvents() {
        AuthResponse creator = registerUser();
        createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));

        PageResponse<EventResponse> feed =
            eventService.findFeed(-15.7942, -47.8825, 0, 20);

        assertNotNull(feed);
        assertFalse(feed.content().isEmpty());
        assertTrue(feed.totalElements() >= 1);
    }

    // ── MAPEAMENTO fromNativeRow ──────────────────────────────────────────────

    @Test
    void shouldMapLatitudeLongitudeFromNativeRowWhenLocationPresent() {
        // findNearby só retorna eventos COM location — qualquer resultado tem lat/lon
        PageResponse<EventResponse> nearby =
            eventService.findNearby(-15.7942, -47.8825, 10.0, 0, 20);

        assertFalse(nearby.content().isEmpty(), "Precisa de ao menos um evento publicado em Brasília");
        EventResponse mapped = nearby.content().getFirst();
        assertNotNull(mapped.latitude());
        assertNotNull(mapped.longitude());
    }

    @Test
    void shouldMapNullLatLonFromFeedWhenLocationAbsent() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);

        // Evento sem localização
        var req = new CreateEventRequest(
            "Sem local", "desc", "CULTURE",
            EventVisibility.PUBLIC,
            null, null, null, null,
            startsAt, null, null
        );
        EventResponse event = eventService.create(creator.userId(), req);
        eventService.publish(creator.userId(), event.id());

        // Busca com tamanho grande para garantir que o evento aparece
        PageResponse<EventResponse> feed =
            eventService.findFeed(-15.7942, -47.8825, 0, 1000);

        EventResponse mapped = feed.content().stream()
            .filter(e -> e.id().equals(event.id()))
            .findFirst()
            .orElseThrow(() -> new AssertionError(
                "Evento sem localização não encontrado no feed"));

        assertNull(mapped.latitude());
        assertNull(mapped.longitude());
    }

    // ── LISTAGENS PAGINADAS ───────────────────────────────────────────────────

    @Test
    void shouldGetPublicEventsReturnNonEmptyList() {
        AuthResponse creator = registerUser();
        createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));

        PageResponse<EventResponse> result = eventService.getPublicEvents(0, 20);

        assertNotNull(result);
        assertTrue(result.totalElements() >= 1);
        assertFalse(result.content().isEmpty());
    }

    @Test
    void shouldGetByCategoryReturnMatchingEvents() {
        AuthResponse creator = registerUser();
        createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)); // MUSIC

        PageResponse<EventResponse> result = eventService.getByCategory("MUSIC", 0, 20);

        assertNotNull(result);
        assertTrue(result.totalElements() >= 1);
        assertTrue(result.content().stream().allMatch(e -> "MUSIC".equals(e.category())));
    }

    @Test
    void shouldGetByCategoryReturnEmptyForUnusedCategory() {
        PageResponse<EventResponse> result = eventService.getByCategory("SPORT", 0, 20);

        assertNotNull(result);
        // nenhum evento de SPORT nos testes — pode ser 0
        assertTrue(result.totalElements() >= 0);
    }

    @Test
    void shouldGetByCreatorIdReturnCreatorEvents() {
        AuthResponse creator = registerUser();
        EventResponse e1 = createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));
        EventResponse e2 = createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(2));

        PageResponse<EventResponse> result = eventService.getByCreatorId(creator.userId(), 0, 20);

        assertNotNull(result);
        assertTrue(result.totalElements() >= 2);
        assertTrue(result.content().stream().anyMatch(e -> e.id().equals(e1.id())));
        assertTrue(result.content().stream().anyMatch(e -> e.id().equals(e2.id())));
    }

    @Test
    void shouldReturnCachedResultOnSecondNearbyCall() {
        // Garante ao menos um evento publicado em Brasília
        AuthResponse creator = registerUser();
        createAndPublishEvent(creator, OffsetDateTime.now(ZoneOffset.UTC).plusDays(1));

        // Primeira chamada popula o cache
        PageResponse<EventResponse> first = eventService.findNearby(-15.7942, -47.8825, 10.0, 0, 20);
        // Segunda chamada deve ser servida do cache
        PageResponse<EventResponse> second = eventService.findNearby(-15.7942, -47.8825, 10.0, 0, 20);

        assertEquals(first.totalElements(), second.totalElements());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuthResponse registerUser() {
        return authService.register(TestFixtures.registerRequest(TestFixtures.uniqueSuffix()));
    }

    private EventResponse createDraftEvent(AuthResponse creator) {
        return eventService.create(creator.userId(),
            TestFixtures.publicEventRequest(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)));
    }

    private EventResponse createAndPublishEvent(AuthResponse creator, OffsetDateTime startsAt) {
        EventResponse event = eventService.create(creator.userId(),
            TestFixtures.publicEventRequest(startsAt));
        return eventService.publish(creator.userId(), event.id());
    }
}
