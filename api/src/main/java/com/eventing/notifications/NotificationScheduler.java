package com.eventing.notifications;

import io.quarkus.scheduler.Scheduled;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class NotificationScheduler {

    @Inject NotificationService notificationService;

    // Habilitado somente quando NOTIFICATIONS_ENABLED=true estiver configurado
    // junto com as credenciais SMTP no ambiente de produção.
    @ConfigProperty(name = "eventing.notifications.enabled", defaultValue = "false")
    boolean enabled;

    @Scheduled(every = "15m", delayed = "2m")
    void checkAndSendReminders() {
        if (!enabled) return;
        notificationService.processReminders24h();
        notificationService.processReminders1h();
    }
}
