package com.eventing;

import com.eventing.auth.dto.RegisterRequest;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import java.time.OffsetDateTime;
import java.util.UUID;

/** Helpers para criar dados de teste de forma consistente. */
public class TestFixtures {

    public static String uniqueSuffix() {
        return UUID.randomUUID().toString().substring(0, 8);
    }

    public static RegisterRequest registerRequest(String suffix) {
        return new RegisterRequest(
            "user_" + suffix + "@test.com",
            "user_" + suffix,
            "senha12345"
        );
    }

    public static CreateEventRequest publicEventRequest(OffsetDateTime startsAt) {
        return new CreateEventRequest(
            "Test Event",
            "Descrição do evento de teste",
            "MUSIC",
            EventVisibility.PUBLIC,
            -15.7942, -47.8825,
            "Brasília", "Endereço de teste",
            startsAt,
            startsAt.plusHours(3),
            100
        );
    }

    public static CreateEventRequest inviteOnlyEventRequest(OffsetDateTime startsAt) {
        return new CreateEventRequest(
            "Evento Privado",
            "Apenas convidados",
            "CULTURE",
            EventVisibility.INVITE_ONLY,
            null, null,
            null, null,
            startsAt,
            null,
            10
        );
    }
}
