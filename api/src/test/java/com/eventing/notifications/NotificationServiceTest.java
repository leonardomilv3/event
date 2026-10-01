package com.eventing.notifications;

import com.eventing.events.EventRepository;
import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import com.eventing.participants.ParticipantRepository;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import io.quarkus.test.InjectMock;
import io.quarkus.test.junit.QuarkusTest;
import io.quarkus.test.junit.TestProfile;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@QuarkusTest
@TestProfile(NotificationTestProfile.class)
class NotificationServiceTest {

    @Inject NotificationService notificationService;

    @InjectMock EventRepository eventRepository;
    @InjectMock ParticipantRepository participantRepository;
    @InjectMock Mailer mailer; // normal-scoped via MockMailerProducer (ver NotificationTestProfile)

    @BeforeEach
    void resetMocks() {
        reset(eventRepository, participantRepository, mailer);
    }

    // ── processReminders24h ───────────────────────────────────────────────────

    @Test
    void shouldSendReminderAndMarkNotified24hWhenEventsFound() {
        Event event = buildEvent("Show de Jazz");
        when(eventRepository.findEventsToNotify(any(), any(), eq(true))).thenReturn(List.of(event));
        when(participantRepository.findParticipantEmailsByEvent(event.id))
                .thenReturn(List.of("alice@test.com", "bob@test.com"));

        int count = notificationService.processReminders24h();

        assertEquals(1, count);
        assertTrue(event.notified24h, "notified24h deve ser true após envio");
        verify(mailer, times(2)).send(any(Mail.class));
    }

    @Test
    void shouldReturnZeroWhenNoEvents24h() {
        when(eventRepository.findEventsToNotify(any(), any(), eq(true))).thenReturn(List.of());

        int count = notificationService.processReminders24h();

        assertEquals(0, count);
        verifyNoInteractions(mailer);
    }

    @Test
    void shouldNotSendWhenNoParticipants24h() {
        Event event = buildEvent("Evento vazio");
        when(eventRepository.findEventsToNotify(any(), any(), eq(true))).thenReturn(List.of(event));
        when(participantRepository.findParticipantEmailsByEvent(event.id)).thenReturn(List.of());

        int count = notificationService.processReminders24h();

        assertEquals(1, count);
        assertTrue(event.notified24h, "notified24h deve ser true mesmo sem participantes");
        verifyNoInteractions(mailer);
    }

    // ── processReminders1h ────────────────────────────────────────────────────

    @Test
    void shouldSendReminderAndMarkNotified1hWhenEventsFound() {
        Event event = buildEvent("Workshop de Dança");
        when(eventRepository.findEventsToNotify(any(), any(), eq(false))).thenReturn(List.of(event));
        when(participantRepository.findParticipantEmailsByEvent(event.id))
                .thenReturn(List.of("carol@test.com"));

        int count = notificationService.processReminders1h();

        assertEquals(1, count);
        assertTrue(event.notified1h, "notified1h deve ser true após envio");
        verify(mailer, times(1)).send(any(Mail.class));
    }

    @Test
    void shouldReturnZeroWhenNoEvents1h() {
        when(eventRepository.findEventsToNotify(any(), any(), eq(false))).thenReturn(List.of());

        int count = notificationService.processReminders1h();

        assertEquals(0, count);
        verifyNoInteractions(mailer);
    }

    // ── conteúdo do e-mail ────────────────────────────────────────────────────

    @Test
    void shouldIncludeEventTitleInEmailSubject() {
        Event event = buildEvent("Festival de Música");
        when(eventRepository.findEventsToNotify(any(), any(), eq(true))).thenReturn(List.of(event));
        when(participantRepository.findParticipantEmailsByEvent(event.id))
                .thenReturn(List.of("diana@test.com"));

        notificationService.processReminders24h();

        ArgumentCaptor<Mail> mailCaptor = ArgumentCaptor.forClass(Mail.class);
        verify(mailer).send(mailCaptor.capture());
        String subject = mailCaptor.getValue().getSubject();
        assertTrue(subject.contains("Festival de Música"),
                "Assunto deve conter o título do evento");
        assertTrue(subject.contains("24 horas"),
                "Assunto deve indicar janela de 24h");
    }

    @Test
    void shouldContinueSendingWhenOneMailFails() {
        Event event = buildEvent("Evento com falha");
        when(eventRepository.findEventsToNotify(any(), any(), eq(true))).thenReturn(List.of(event));
        when(participantRepository.findParticipantEmailsByEvent(event.id))
                .thenReturn(List.of("bad@fail.com", "good@test.com"));
        doThrow(new RuntimeException("SMTP timeout"))
                .doNothing()
                .when(mailer).send(any(Mail.class));

        // Não deve lançar exceção
        assertDoesNotThrow(() -> notificationService.processReminders24h());
        assertTrue(event.notified24h);
        verify(mailer, times(2)).send(any(Mail.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private Event buildEvent(String title) {
        Event e = new Event();
        e.id = UUID.randomUUID();
        e.title = title;
        e.status = EventStatus.PUBLISHED;
        e.locationName = "Local de Teste";
        e.address = "Endereço de Teste";
        e.startsAt = LocalDateTime.now(ZoneOffset.UTC).plusHours(24);
        e.notified24h = false;
        e.notified1h = false;
        return e;
    }
}
