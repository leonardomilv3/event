package com.eventing.notifications;

import com.eventing.events.EventRepository;
import com.eventing.events.domain.Event;
import com.eventing.participants.ParticipantRepository;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.config.inject.ConfigProperty;

import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.List;

@ApplicationScoped
public class NotificationService {

    @Inject EventRepository eventRepository;
    @Inject ParticipantRepository participantRepository;
    @Inject Mailer mailer;

    @ConfigProperty(name = "eventing.app.url", defaultValue = "https://event-ten-delta.vercel.app")
    String appUrl;

    @Transactional
    public int processReminders24h() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        List<Event> events = eventRepository.findEventsToNotify(
                now.plusHours(23).plusMinutes(30),
                now.plusHours(24).plusMinutes(30),
                true
        );
        for (Event event : events) {
            sendToParticipants(event, "24 horas");
            event.notified24h = true;
        }
        return events.size();
    }

    @Transactional
    public int processReminders1h() {
        LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        List<Event> events = eventRepository.findEventsToNotify(
                now.plusMinutes(50),
                now.plusMinutes(70),
                false
        );
        for (Event event : events) {
            sendToParticipants(event, "1 hora");
            event.notified1h = true;
        }
        return events.size();
    }

    private void sendToParticipants(Event event, String timeLabel) {
        List<String> emails = participantRepository.findParticipantEmailsByEvent(event.id);
        for (String email : emails) {
            try {
                mailer.send(Mail.withText(email, buildSubject(event, timeLabel), buildBody(event, timeLabel)));
            } catch (Exception ignored) {
                // falha individual não interrompe os demais envios
            }
        }
    }

    private String buildSubject(Event event, String timeLabel) {
        return "Lembrete: \"" + event.title + "\" começa em " + timeLabel;
    }

    private String buildBody(Event event, String timeLabel) {
        StringBuilder sb = new StringBuilder();
        sb.append("Olá!\n\n");
        sb.append("Este é um lembrete: o evento \"")
          .append(event.title).append("\" começa em ").append(timeLabel).append(".\n\n");
        if (event.locationName != null) sb.append("Local: ").append(event.locationName).append("\n");
        if (event.address != null)      sb.append("Endereço: ").append(event.address).append("\n");
        sb.append("\nVeja o evento: ").append(appUrl).append("/events/").append(event.id).append("\n\n");
        sb.append("— Equipe Eventing");
        return sb.toString();
    }
}
