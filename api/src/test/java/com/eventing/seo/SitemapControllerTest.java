package com.eventing.seo;

import com.eventing.TestFixtures;
import com.eventing.auth.AuthService;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.events.domain.EventVisibility;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventResponse;
import com.eventing.events.service.EventService;
import io.quarkus.redis.datasource.RedisDataSource;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class SitemapControllerTest {

    @Inject AuthService authService;
    @Inject EventService eventService;
    @Inject RedisDataSource redis;

    @BeforeEach
    void clearSitemapCache() {
        try {
            redis.key(String.class).del(SitemapService.CACHE_KEY);
        } catch (Exception ignored) {
            // Redis indisponível: serviço já cai para o DB
        }
    }

    @Test
    void sitemapShouldBePublicAndListPublishedPublicEvents() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(2);
        EventResponse event = eventService.create(creator.userId(), TestFixtures.publicEventRequest(startsAt));
        eventService.publish(creator.userId(), event.id());

        given()
        .when()
            .get("/sitemap.xml")
        .then()
            .statusCode(200)
            .contentType(containsString("application/xml"))
            .body(containsString("<urlset"))
            .body(containsString("/events/" + event.id() + "</loc>"));
    }

    @Test
    void sitemapShouldNotListDraftPrivateOrInviteOnlyEvents() {
        AuthResponse creator = registerUser();
        OffsetDateTime startsAt = OffsetDateTime.now(ZoneOffset.UTC).plusDays(2);
        EventResponse draft = eventService.create(creator.userId(), TestFixtures.publicEventRequest(startsAt));
        EventResponse inviteOnly = eventService.create(creator.userId(), TestFixtures.inviteOnlyEventRequest(startsAt));
        eventService.publish(creator.userId(), inviteOnly.id());
        var base = TestFixtures.publicEventRequest(startsAt);
        EventResponse privateEvent = eventService.create(creator.userId(), new CreateEventRequest(
            base.title(), base.description(), base.category(), EventVisibility.PRIVATE,
            base.latitude(), base.longitude(), base.locationName(), base.address(),
            base.startsAt(), base.endsAt(), base.maxParticipants()));
        eventService.publish(creator.userId(), privateEvent.id());

        given()
        .when()
            .get("/sitemap.xml")
        .then()
            .statusCode(200)
            .body(not(containsString(draft.id().toString())))
            .body(not(containsString(inviteOnly.id().toString())))
            .body(not(containsString(privateEvent.id().toString())));
    }

    private AuthResponse registerUser() {
        return authService.register(TestFixtures.registerRequest(TestFixtures.uniqueSuffix()));
    }
}
