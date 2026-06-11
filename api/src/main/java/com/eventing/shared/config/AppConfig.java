package com.eventing.shared.config;

import jakarta.enterprise.context.ApplicationScoped;
import org.eclipse.microprofile.config.inject.ConfigProperty;

@ApplicationScoped
public class AppConfig {

    @ConfigProperty(name = "mp.jwt.verify.issuer")
    String jwtIssuer;

    @ConfigProperty(name = "smallrye.jwt.new-token.lifespan", defaultValue = "86400")
    long jwtLifespanSeconds;

    public String getJwtIssuer() {
        return jwtIssuer;
    }

    public long getJwtLifespanSeconds() {
        return jwtLifespanSeconds;
    }
}
