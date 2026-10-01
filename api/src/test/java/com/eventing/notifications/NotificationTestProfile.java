package com.eventing.notifications;

import io.quarkus.test.junit.QuarkusTestProfile;

import java.util.Set;

public class NotificationTestProfile implements QuarkusTestProfile {

    @Override
    public Set<Class<?>> getEnabledAlternatives() {
        return Set.of(MockMailerProducer.class);
    }
}
