package com.eventing.participants;

import com.eventing.auth.AuthService;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.service.EventService;
import com.eventing.participants.service.ParticipantService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
public class ParticipantServiceTest {

    @Inject AuthService authService;
    @Inject EventService eventService;
    @Inject ParticipantService participantService;

    @Test
    void shouldJoinEvent() {
        // Emails únicos por execução — evita conflito com dados existentes
        String suffix = UUID.randomUUID().toString().substring(0, 8);

        var creator = authService.register(
            new RegisterRequest("creator_" + suffix + "@test.com", "creator_" + suffix, "senha123"));
        var joiner = authService.register(
            new RegisterRequest("joiner_" + suffix + "@test.com", "joiner_" + suffix, "senha123"));

        UUID creatorId = creator.userId();
        UUID joinerId = joiner.userId();

        var req = new CreateEventRequest(
            "Test Event",
            "descrição",
            "MUSIC",
            EventVisibility.PUBLIC,
            -15.7942,
            -47.8825,
            "Brasília",
            null,
            LocalDateTime.now().plusDays(1),
            null,
            null
        );
        var event = eventService.create(creatorId, req);
        eventService.publish(creatorId, event.id());

        var participation = participantService.join(joinerId, event.id());

        assertNotNull(participation);
        assertEquals("APPROVED", participation.status().toString());
    }
}