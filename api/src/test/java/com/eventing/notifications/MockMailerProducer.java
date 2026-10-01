package com.eventing.notifications;

import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.inject.Alternative;
import jakarta.enterprise.inject.Produces;
import org.mockito.Mockito;

/**
 * O Mailer da extensão é um bean sintético @Singleton — @InjectMock exige escopo normal
 * e @MockitoConfig(convertScopes) não alcança beans sintéticos. Esta alternativa
 * @ApplicationScoped só é habilitada via {@link NotificationTestProfile}; demais testes
 * continuam usando o Mailer real (mock=true em test).
 */
@Alternative
@ApplicationScoped
public class MockMailerProducer {

    @Produces
    @ApplicationScoped
    Mailer mailer() {
        return Mockito.mock(Mailer.class);
    }
}
