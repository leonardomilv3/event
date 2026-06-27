package com.eventing.participants;

import com.eventing.TestFixtures;
import com.eventing.auth.AuthService;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventResponse;
import com.eventing.events.service.EventService;
import com.eventing.participants.domain.ParticipantStatus;
import com.eventing.participants.dto.ParticipantResponse;
import com.eventing.participants.service.ParticipantService;
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
public class ParticipantServiceTest {

    @Inject AuthService authService;
    @Inject EventService eventService;
    @Inject ParticipantService participantService;

    // ── Teste original preservado ─────────────────────────────────────────────

    @Test
    void shouldJoinEvent() {
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        var creator = authService.register(
            new RegisterRequest("creator_" + suffix + "@test.com", "creator_" + suffix, "senha123"));
        var joiner = authService.register(
            new RegisterRequest("joiner_" + suffix + "@test.com", "joiner_" + suffix, "senha123"));

        var req = new CreateEventRequest(
            "Test Event", "descrição", "MUSIC",
            EventVisibility.PUBLIC,
            -15.7942, -47.8825, "Brasília", null,
            OffsetDateTime.now(ZoneOffset.UTC).plusDays(1),
            null, null
        );
        var event = eventService.create(creator.userId(), req);
        eventService.publish(creator.userId(), event.id());

        var participation = participantService.join(joiner.userId(), event.id());

        assertNotNull(participation);
        assertEquals("APPROVED", participation.status().toString());
    }

    // ── JOIN ──────────────────────────────────────────────────────────────────

    @Test
    void shouldJoinInviteOnlyEventWithRequestedStatus() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.INVITE_ONLY);
        AuthResponse joiner = registerUser();

        ParticipantResponse result = participantService.join(joiner.userId(), event.id());

        assertEquals(ParticipantStatus.REQUESTED, result.status());
    }

    @Test
    void shouldFailJoinOnDraftEvent() {
        AuthResponse creator = registerUser();
        EventResponse event = createDraft(creator); // não publicado
        AuthResponse joiner = registerUser();

        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.join(joiner.userId(), event.id()));

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void shouldFailJoinTwice() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id());

        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.join(joiner.userId(), event.id()));

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
    }

    @Test
    void shouldRejoinAfterLeave() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id());
        participantService.leave(joiner.userId(), event.id());

        // Re-join deve funcionar e retornar APPROVED
        ParticipantResponse rejoined = participantService.join(joiner.userId(), event.id());

        assertEquals(ParticipantStatus.APPROVED, rejoined.status());
        assertNotNull(rejoined.joinedAt());
    }

    @Test
    void shouldFailJoinWhenMaxParticipantsReached() {
        AuthResponse creator = registerUser();
        // maxParticipants = 1
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        var req = new CreateEventRequest(
            "Evento Lotado", "desc", "MUSIC", EventVisibility.PUBLIC,
            -15.79, -47.88, "Brasília", null, startsAt, null, 1
        );
        EventResponse event = eventService.create(creator.userId(), req);
        eventService.publish(creator.userId(), event.id());

        // Primeiro participante entra
        AuthResponse first = registerUser();
        participantService.join(first.userId(), event.id());

        // Segundo participante deve ser recusado
        AuthResponse second = registerUser();
        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.join(second.userId(), event.id()));

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void shouldApproveJoinWhenMaxParticipantsIsNull() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        var req = new CreateEventRequest(
            "Sem Limite", "desc", "MUSIC", EventVisibility.PUBLIC,
            -15.79, -47.88, "Brasília", null, startsAt, null, null // sem limite
        );
        EventResponse event = eventService.create(creator.userId(), req);
        eventService.publish(creator.userId(), event.id());

        AuthResponse joiner = registerUser();
        ParticipantResponse result = participantService.join(joiner.userId(), event.id());

        assertEquals(ParticipantStatus.APPROVED, result.status());
    }

    @Test
    void shouldIncrementParticipantCountOnApprovedJoin() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);

        long countBefore = participantService.listParticipants(event.id(), 0, 100).totalElements();

        AuthResponse joiner = registerUser();
        participantService.join(joiner.userId(), event.id());

        long countAfter = participantService.listParticipants(event.id(), 0, 100).totalElements();

        assertEquals(countBefore + 1, countAfter);
    }

    // ── LEAVE ─────────────────────────────────────────────────────────────────

    @Test
    void shouldDecrementCountWhenApprovedParticipantLeaves() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id());
        long countBefore = participantService.listParticipants(event.id(), 0, 100).totalElements();

        participantService.leave(joiner.userId(), event.id());

        long countAfter = participantService.listParticipants(event.id(), 0, 100).totalElements();
        assertEquals(countBefore - 1, countAfter);
    }

    @Test
    void shouldNotDecrementCountWhenRequestedParticipantLeaves() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.INVITE_ONLY);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id()); // REQUESTED
        long countBefore = participantService.listParticipants(event.id(), 0, 100).totalElements();

        participantService.leave(joiner.userId(), event.id()); // DECLINED, sem decrementar

        long countAfter = participantService.listParticipants(event.id(), 0, 100).totalElements();
        assertEquals(countBefore, countAfter); // nenhuma mudança no count de APPROVED
    }

    @Test
    void shouldFailLeaveWhenNotParticipant() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse nonParticipant = registerUser();

        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.leave(nonParticipant.userId(), event.id()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    @Test
    void shouldFailLeaveWhenAlreadyDeclined() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id());
        participantService.leave(joiner.userId(), event.id()); // primeira saída → DECLINED

        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.leave(joiner.userId(), event.id())); // já DECLINED

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    @Test
    void participantCountShouldNeverGoBelowZero() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id());   // count = 1
        participantService.leave(joiner.userId(), event.id());  // count = 0

        // Após leave, count de APPROVED deve ser 0
        long count = participantService.listParticipants(event.id(), 0, 100).totalElements();
        assertEquals(0, count);
    }

    // ── LIST PARTICIPANTS ─────────────────────────────────────────────────────

    @Test
    void shouldListThreeApprovedParticipants() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);

        participantService.join(registerUser().userId(), event.id());
        participantService.join(registerUser().userId(), event.id());
        participantService.join(registerUser().userId(), event.id());

        PageResponse<ParticipantResponse> result =
            participantService.listParticipants(event.id(), 0, 100);

        assertTrue(result.totalElements() >= 3);
    }

    @Test
    void shouldExcludeRequestedParticipantsFromListing() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.INVITE_ONLY);
        AuthResponse joiner = registerUser();

        participantService.join(joiner.userId(), event.id()); // REQUESTED

        PageResponse<ParticipantResponse> result =
            participantService.listParticipants(event.id(), 0, 100);

        // Participante REQUESTED não deve aparecer na lista de APPROVED
        boolean anyFound = result.content().stream()
            .anyMatch(p -> p.userId().equals(joiner.userId()));
        assertFalse(anyFound);
    }

    @Test
    void shouldFailListParticipantsForNonexistentEvent() {
        ApiException ex = assertThrows(ApiException.class,
            () -> participantService.listParticipants(UUID.randomUUID(), 0, 20));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    @Test
    void listParticipantsShouldPaginateCorrectly() {
        AuthResponse creator = registerUser();
        EventResponse event = createAndPublish(creator, EventVisibility.PUBLIC);

        participantService.join(registerUser().userId(), event.id());
        participantService.join(registerUser().userId(), event.id());
        participantService.join(registerUser().userId(), event.id());

        // Página com size=1 deve retornar 1 item mas totalElements=3 (mínimo)
        PageResponse<ParticipantResponse> page =
            participantService.listParticipants(event.id(), 0, 1);

        assertEquals(1, page.content().size());
        assertTrue(page.totalElements() >= 3);
    }

    // ── MY EVENTS ─────────────────────────────────────────────────────────────

    @Test
    void shouldReturnTwoEventsForUserWithTwoApprovedParticipations() {
        AuthResponse creator = registerUser();
        EventResponse event1 = createAndPublish(creator, EventVisibility.PUBLIC);
        EventResponse event2 = createAndPublish(creator, EventVisibility.PUBLIC);

        AuthResponse participant = registerUser();
        participantService.join(participant.userId(), event1.id());
        participantService.join(participant.userId(), event2.id());

        PageResponse<EventResponse> myEvents =
            participantService.getMyEvents(participant.userId(), 0, 20);

        assertTrue(myEvents.totalElements() >= 2);
        assertTrue(myEvents.content().stream().anyMatch(e -> e.id().equals(event1.id())));
        assertTrue(myEvents.content().stream().anyMatch(e -> e.id().equals(event2.id())));
    }

    @Test
    void shouldReturnEmptyListForUserWithNoParticipations() {
        AuthResponse newUser = registerUser();

        PageResponse<EventResponse> myEvents =
            participantService.getMyEvents(newUser.userId(), 0, 20);

        assertEquals(0, myEvents.totalElements());
        assertTrue(myEvents.content().isEmpty());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuthResponse registerUser() {
        return authService.register(TestFixtures.registerRequest(TestFixtures.uniqueSuffix()));
    }

    private EventResponse createDraft(AuthResponse creator) {
        return eventService.create(creator.userId(),
            TestFixtures.publicEventRequest(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)));
    }

    private EventResponse createAndPublish(AuthResponse creator, EventVisibility visibility) {
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(1);
        var req = new CreateEventRequest(
            "Test Event", "desc", "MUSIC", visibility,
            -15.79, -47.88, "Brasília", null, startsAt, null, null
        );
        EventResponse event = eventService.create(creator.userId(), req);
        return eventService.publish(creator.userId(), event.id());
    }
}
