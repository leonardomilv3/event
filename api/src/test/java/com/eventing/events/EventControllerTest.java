package com.eventing.events;

import com.eventing.TestFixtures;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class EventControllerTest {

    // ── POST /api/events ──────────────────────────────────────────────────────

    @Test
    void createShouldReturn201WithStatusDraft() {
        String token = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)))
        .when()
            .post("/api/events")
        .then()
            .statusCode(201)
            .body("data.status", equalTo("DRAFT"))
            .body("data.id", notNullValue());
    }

    @Test
    void createShouldReturn401WithoutToken() {
        given()
            .contentType(ContentType.JSON)
            .body(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)))
        .when()
            .post("/api/events")
        .then()
            .statusCode(401);
    }

    @Test
    void createShouldReturn400WithoutTitle() {
        String token = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "category", "MUSIC",
                "startsAt", OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).toString()
            ))
        .when()
            .post("/api/events")
        .then()
            .statusCode(400);
    }

    @Test
    void createShouldReturn400ForNonHttpSourceUrl() {
        String token = registerAndLogin();
        var body = new java.util.HashMap<>(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)));
        body.put("sourceUrl", "javascript:alert(1)");

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/api/events")
        .then()
            .statusCode(400);
    }

    @Test
    void createShouldReturn400WithoutEndsAt() {
        String token = registerAndLogin();
        var body = new java.util.HashMap<>(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)));
        body.remove("endsAt");

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(body)
        .when()
            .post("/api/events")
        .then()
            .statusCode(400);
    }

    @Test
    void createShouldReturn400ForPastStartsAt() {
        String token = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).minusDays(1)))
        .when()
            .post("/api/events")
        .then()
            .statusCode(400);
    }

    // ── GET /api/events/{id} ──────────────────────────────────────────────────

    @Test
    void getByIdShouldReturn200() {
        String token = registerAndLogin();
        UUID eventId = createAndPublishEvent(token, "PUBLIC");

        given()
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(200)
            .body("data.id", equalTo(eventId.toString()))
            .body("success", is(true));
    }

    // ── Controle de acesso a eventos não públicos ─────────────────────────────

    @Test
    void getByIdPrivateShouldReturn404ForAnonymous() {
        UUID eventId = createAndPublishEvent(registerAndLogin(), "PRIVATE");

        given()
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404)
            .body("data", nullValue());
    }

    @Test
    void getByIdPrivateShouldReturn404ForAuthenticatedNonParticipant() {
        UUID eventId = createAndPublishEvent(registerAndLogin(), "PRIVATE");
        String strangerToken = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + strangerToken)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404);
    }

    @Test
    void getByIdPrivateShouldReturn200ForCreator() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PRIVATE");

        given()
            .header("Authorization", "Bearer " + ownerToken)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(200)
            .body("data.id", equalTo(eventId.toString()));
    }

    @Test
    void getByIdPrivateShouldReturn200ForConfirmedParticipant() {
        // Admissão legítima: entra enquanto PUBLIC; criador depois torna o evento PRIVATE
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String participantToken = registerAndLogin();
        given().header("Authorization", "Bearer " + participantToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201);
        makePrivate(ownerToken, eventId);

        given()
            .header("Authorization", "Bearer " + participantToken)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(200)
            .body("data.id", equalTo(eventId.toString()));
    }

    @Test
    void getByIdInviteOnlyShouldReturn404ForPendingRequest() {
        UUID eventId = createAndPublishEvent(registerAndLogin(), "INVITE_ONLY");
        String requesterToken = registerAndLogin();
        given().header("Authorization", "Bearer " + requesterToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201)
            .body("data.status", equalTo("REQUESTED"));

        given()
            .header("Authorization", "Bearer " + requesterToken)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404);
    }

    // ── Rascunhos: só o criador enxerga ───────────────────────────────────────

    @Test
    void getByIdDraftShouldReturn404ForAnonymous() {
        UUID eventId = createEvent(registerAndLogin());

        given()
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404);
    }

    @Test
    void getByIdDraftShouldReturn404ForOtherUser() {
        UUID eventId = createEvent(registerAndLogin());

        given()
            .header("Authorization", "Bearer " + registerAndLogin())
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404);
    }

    @Test
    void getByIdDraftShouldReturn200ForCreator() {
        String ownerToken = registerAndLogin();
        UUID eventId = createEvent(ownerToken);

        given()
            .header("Authorization", "Bearer " + ownerToken)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(200)
            .body("data.status", equalTo("DRAFT"));
    }

    // ── Join em PRIVATE: só quem já foi admitido ──────────────────────────────

    @Test
    void joinPrivateEventShouldReturn404ForNonAdmittedUser() {
        UUID eventId = createAndPublishEvent(registerAndLogin(), "PRIVATE");

        given()
            .header("Authorization", "Bearer " + registerAndLogin())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(404);
    }

    @Test
    void rejoinPrivateEventShouldWorkForPreviouslyAdmittedUser() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String participantToken = registerAndLogin();
        given().header("Authorization", "Bearer " + participantToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201);
        makePrivate(ownerToken, eventId);
        given().header("Authorization", "Bearer " + participantToken)
            .delete("/api/events/" + eventId + "/leave").then().statusCode(204);

        given()
            .header("Authorization", "Bearer " + participantToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(201)
            .body("data.status", equalTo("APPROVED"));
    }

    // ── GET /api/events?creatorId= ────────────────────────────────────────────

    @Test
    void listByCreatorShouldHideNonPublicAndDraftsFromOthers() {
        String ownerToken = registerAndLogin();
        UUID publicId = createAndPublishEvent(ownerToken, "PUBLIC");
        UUID privateId = createAndPublishEvent(ownerToken, "PRIVATE");
        UUID inviteOnlyId = createAndPublishEvent(ownerToken, "INVITE_ONLY");
        UUID draftId = createEvent(ownerToken);
        String creatorId = given().header("Authorization", "Bearer " + ownerToken)
            .get("/api/events/" + publicId).then().extract().path("data.creatorId");

        given()
            .queryParam("creatorId", creatorId)
        .when()
            .get("/api/events")
        .then()
            .statusCode(200)
            .body("data.totalElements", equalTo(1))
            .body("data.content.id", contains(publicId.toString()))
            .body("data.content.id", not(hasItems(privateId.toString())))
            .body("data.content.id", not(hasItems(inviteOnlyId.toString())))
            .body("data.content.id", not(hasItems(draftId.toString())));
    }

    @Test
    void listByCreatorShouldShowAllEventsToOwner() {
        String ownerToken = registerAndLogin();
        UUID publicId = createAndPublishEvent(ownerToken, "PUBLIC");
        UUID privateId = createAndPublishEvent(ownerToken, "PRIVATE");
        UUID draftId = createEvent(ownerToken);
        String creatorId = given().header("Authorization", "Bearer " + ownerToken)
            .get("/api/events/" + publicId).then().extract().path("data.creatorId");

        given()
            .header("Authorization", "Bearer " + ownerToken)
            .queryParam("creatorId", creatorId)
        .when()
            .get("/api/events")
        .then()
            .statusCode(200)
            .body("data.totalElements", equalTo(3))
            .body("data.content.id", hasItems(publicId.toString(), privateId.toString(), draftId.toString()));
    }

    @Test
    void listParticipantsPrivateShouldReturn404ForAnonymous() {
        UUID eventId = createAndPublishEvent(registerAndLogin(), "PRIVATE");

        given()
        .when()
            .get("/api/events/" + eventId + "/participants")
        .then()
            .statusCode(404);
    }

    @Test
    void getByIdShouldReturn404ForNonexistentId() {
        given()
        .when()
            .get("/api/events/" + UUID.randomUUID())
        .then()
            .statusCode(404);
    }

    @Test
    void getByIdShouldReturn404ForMalformedUuid() {
        given()
        .when()
            .get("/api/events/nao-e-um-uuid")
        .then()
            .statusCode(404);
    }

    // ── PUT /api/events/{id} ──────────────────────────────────────────────────

    @Test
    void updateShouldReturn200ForOwner() {
        String token = registerAndLogin();
        UUID eventId = createEvent(token);

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(Map.of("title", "Título Atualizado"))
        .when()
            .put("/api/events/" + eventId)
        .then()
            .statusCode(200)
            .body("data.title", equalTo("Título Atualizado"));
    }

    @Test
    void updateShouldReturn403ForNonOwner() {
        String ownerToken = registerAndLogin();
        String otherToken = registerAndLogin();
        UUID eventId = createEvent(ownerToken);

        given()
            .header("Authorization", "Bearer " + otherToken)
            .contentType(ContentType.JSON)
            .body(Map.of("title", "Invasão"))
        .when()
            .put("/api/events/" + eventId)
        .then()
            .statusCode(403);
    }

    @Test
    void updateShouldReturn401WithoutToken() {
        String token = registerAndLogin();
        UUID eventId = createEvent(token);

        given()
            .contentType(ContentType.JSON)
            .body(Map.of("title", "Invasão"))
        .when()
            .put("/api/events/" + eventId)
        .then()
            .statusCode(401);
    }

    // ── DELETE /api/events/{id} ───────────────────────────────────────────────

    @Test
    void deleteShouldReturn204ForOwner() {
        String token = registerAndLogin();
        UUID eventId = createEvent(token);

        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .delete("/api/events/" + eventId)
        .then()
            .statusCode(204);

        // Hard delete: o evento deixa de existir
        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/api/events/" + eventId)
        .then()
            .statusCode(404);
    }

    @Test
    void deleteShouldReturn403ForNonOwner() {
        String ownerToken = registerAndLogin();
        String otherToken = registerAndLogin();
        UUID eventId = createEvent(ownerToken);

        given()
            .header("Authorization", "Bearer " + otherToken)
        .when()
            .delete("/api/events/" + eventId)
        .then()
            .statusCode(403);
    }

    // ── POST /api/events/{id}/publish ─────────────────────────────────────────

    @Test
    void publishShouldReturn200AndStatusPublished() {
        String token = registerAndLogin();
        UUID eventId = createEvent(token);

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/publish")
        .then()
            .statusCode(200)
            .body("data.status", equalTo("PUBLISHED"));
    }

    @Test
    void publishTwiceShouldReturn400() {
        String token = registerAndLogin();
        UUID eventId = createEvent(token);

        given().header("Authorization", "Bearer " + token).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/publish").then().statusCode(200);

        given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/publish")
        .then()
            .statusCode(400);
    }

    // ── GET /api/events/nearby ────────────────────────────────────────────────

    @Test
    void nearbyShouldReturn200WithContentArray() {
        given()
            .queryParam("lat", -15.7942)
            .queryParam("lon", -47.8825)
            .queryParam("radius", 10)
        .when()
            .get("/api/events/nearby")
        .then()
            .statusCode(200)
            .body("data.content", instanceOf(java.util.List.class));
    }

    @Test
    void nearbyShouldReturn400WhenLatMissing() {
        given()
            .queryParam("lon", -47.8825)
        .when()
            .get("/api/events/nearby")
        .then()
            .statusCode(400);
    }

    @Test
    void nearbyShouldReturn400WhenRadiusExceeds50() {
        given()
            .queryParam("lat", -15.7942)
            .queryParam("lon", -47.8825)
            .queryParam("radius", 51)
        .when()
            .get("/api/events/nearby")
        .then()
            .statusCode(400);
    }

    // ── GET /api/events/feed ──────────────────────────────────────────────────

    @Test
    void feedShouldReturn200WithContentArray() {
        given()
            .queryParam("lat", -15.7942)
            .queryParam("lon", -47.8825)
        .when()
            .get("/api/events/feed")
        .then()
            .statusCode(200)
            .body("data.content", instanceOf(java.util.List.class));
    }

    @Test
    void feedShouldReturn400WhenLatMissing() {
        given()
            .queryParam("lon", -47.8825)
        .when()
            .get("/api/events/feed")
        .then()
            .statusCode(400);
    }

    // ── POST /api/events/{id}/join ────────────────────────────────────────────

    @Test
    void joinPublicEventShouldReturn201WithStatusApproved() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String joinerToken = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + joinerToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(201)
            .body("data.status", equalTo("APPROVED"));
    }

    @Test
    void joinInviteOnlyEventShouldReturn201WithStatusRequested() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "INVITE_ONLY");
        String joinerToken = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + joinerToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(201)
            .body("data.status", equalTo("REQUESTED"));
    }

    @Test
    void joinTwiceShouldReturn409() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String joinerToken = registerAndLogin();

        given().header("Authorization", "Bearer " + joinerToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201);

        given()
            .header("Authorization", "Bearer " + joinerToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(409);
    }

    @Test
    void joinDraftOfOtherUserShouldReturn404() {
        String ownerToken = registerAndLogin();
        UUID eventId = createEvent(ownerToken); // DRAFT — invisível para terceiros
        String joinerToken = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + joinerToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(404);
    }

    @Test
    void joinOwnDraftShouldReturn400() {
        String ownerToken = registerAndLogin();
        UUID eventId = createEvent(ownerToken);

        given()
            .header("Authorization", "Bearer " + ownerToken)
            .contentType(ContentType.JSON)
        .when()
            .post("/api/events/" + eventId + "/join")
        .then()
            .statusCode(400);
    }

    // ── DELETE /api/events/{id}/leave ─────────────────────────────────────────

    @Test
    void leaveShouldReturn204ForApprovedParticipant() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String joinerToken = registerAndLogin();

        given().header("Authorization", "Bearer " + joinerToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201);

        given()
            .header("Authorization", "Bearer " + joinerToken)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/events/" + eventId + "/leave")
        .then()
            .statusCode(204);
    }

    @Test
    void leaveShouldReturn404ForNonParticipant() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String nonParticipantToken = registerAndLogin();

        given()
            .header("Authorization", "Bearer " + nonParticipantToken)
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/events/" + eventId + "/leave")
        .then()
            .statusCode(404);
    }

    // ── GET /api/events/{id}/participants ─────────────────────────────────────

    @Test
    void listParticipantsShouldReturn200WithNonEmptyContent() {
        String ownerToken = registerAndLogin();
        UUID eventId = createAndPublishEvent(ownerToken, "PUBLIC");
        String joinerToken = registerAndLogin();
        given().header("Authorization", "Bearer " + joinerToken).contentType(ContentType.JSON)
            .post("/api/events/" + eventId + "/join").then().statusCode(201);

        given()
        .when()
            .get("/api/events/" + eventId + "/participants")
        .then()
            .statusCode(200)
            .body("data.content", hasSize(greaterThanOrEqualTo(1)));
    }

    @Test
    void listParticipantsShouldReturn404ForNonexistentEvent() {
        given()
        .when()
            .get("/api/events/" + UUID.randomUUID() + "/participants")
        .then()
            .statusCode(404);
    }

    // ── GET /api/events (list) ────────────────────────────────────────────────

    @Test
    void listEventsShouldReturn200WithPageStructure() {
        given()
        .when()
            .get("/api/events")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.content", instanceOf(java.util.List.class))
            .body("data.totalElements", greaterThanOrEqualTo(0));
    }

    @Test
    void listEventsByCategory_shouldReturn200() {
        given()
            .queryParam("category", "MUSIC")
        .when()
            .get("/api/events")
        .then()
            .statusCode(200)
            .body("data.content", instanceOf(java.util.List.class));
    }

    @Test
    void listEventsByCreatorId_shouldReturn200() {
        String suffix = TestFixtures.uniqueSuffix();
        String userId = given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "creator_" + suffix + "@test.com",
                "username", "creator_" + suffix,
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .extract().path("data.userId");

        given()
            .queryParam("creatorId", userId)
        .when()
            .get("/api/events")
        .then()
            .statusCode(200)
            .body("data.content", instanceOf(java.util.List.class));
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String registerAndLogin() {
        String suffix = TestFixtures.uniqueSuffix();
        given().contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when().post("/api/auth/register").then().statusCode(201);

        return given().contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "password", "senha12345"
            ))
        .when().post("/api/auth/login")
        .then().extract().path("data.token");
    }

    private UUID createEvent(String token) {
        String id = given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(buildCreateBody(OffsetDateTime.now(ZoneOffset.UTC).plusDays(1)))
        .when().post("/api/events")
        .then().statusCode(201).extract().path("data.id");
        return UUID.fromString(id);
    }

    private void makePrivate(String ownerToken, UUID eventId) {
        given().header("Authorization", "Bearer " + ownerToken).contentType(ContentType.JSON)
            .body(Map.of("visibility", "PRIVATE"))
            .put("/api/events/" + eventId).then().statusCode(200)
            .body("data.visibility", equalTo("PRIVATE"));
    }

    private UUID createAndPublishEvent(String token, String visibility) {
        String id = given()
            .header("Authorization", "Bearer " + token)
            .contentType(ContentType.JSON)
            .body(Map.of(
                "title", "Test Event",
                "category", "MUSIC",
                "visibility", visibility,
                "latitude", -15.7942,
                "longitude", -47.8825,
                "locationName", "Brasília",
                "startsAt", OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).toString(),
                "endsAt", OffsetDateTime.now(ZoneOffset.UTC).plusDays(1).plusHours(2).toString()
            ))
        .when().post("/api/events")
        .then().statusCode(201).extract().path("data.id");

        given().header("Authorization", "Bearer " + token).contentType(ContentType.JSON)
            .post("/api/events/" + id + "/publish").then().statusCode(200);

        return UUID.fromString(id);
    }

    private static Map<String, Object> buildCreateBody(OffsetDateTime startsAt) {
        return Map.of(
            "title", "Test Event",
            "category", "MUSIC",
            "visibility", "PUBLIC",
            "latitude", -15.7942,
            "longitude", -47.8825,
            "locationName", "Brasília",
            "startsAt", startsAt.toString(),
            "endsAt", startsAt.plusHours(2).toString()
        );
    }
}
