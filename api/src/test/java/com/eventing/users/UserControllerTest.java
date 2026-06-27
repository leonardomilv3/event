package com.eventing.users;

import com.eventing.TestFixtures;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class UserControllerTest {

    // ── GET /api/users/me ─────────────────────────────────────────────────────

    @Test
    void meShouldReturn200WithFullProfile() {
        RegisteredUser user = registerUser();

        given()
            .header("Authorization", "Bearer " + user.token())
        .when()
            .get("/api/users/me")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.id", equalTo(user.id().toString()))
            .body("data.email", notNullValue())
            .body("data.username", notNullValue());
    }

    @Test
    void meShouldReturn401WithoutToken() {
        given()
        .when()
            .get("/api/users/me")
        .then()
            .statusCode(401);
    }

    // ── PUT /api/users/me ─────────────────────────────────────────────────────

    @Test
    void updateMeShouldReturn200WithUpdatedDisplayName() {
        RegisteredUser user = registerUser();

        given()
            .header("Authorization", "Bearer " + user.token())
            .contentType(ContentType.JSON)
            .body(Map.of("displayName", "Novo Nome"))
        .when()
            .put("/api/users/me")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.displayName", equalTo("Novo Nome"));
    }

    @Test
    void updateMeShouldReturn200WithBioAndCity() {
        RegisteredUser user = registerUser();

        given()
            .header("Authorization", "Bearer " + user.token())
            .contentType(ContentType.JSON)
            .body(Map.of(
                "bio", "Amante de eventos",
                "city", "São Paulo"
            ))
        .when()
            .put("/api/users/me")
        .then()
            .statusCode(200)
            .body("data.bio", equalTo("Amante de eventos"))
            .body("data.city", equalTo("São Paulo"));
    }

    @Test
    void updateMeShouldReturn401WithoutToken() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of("displayName", "Hacker"))
        .when()
            .put("/api/users/me")
        .then()
            .statusCode(401);
    }

    // ── GET /api/users/me/events ──────────────────────────────────────────────

    @Test
    void getMyEventsShouldReturn200WithPageStructure() {
        RegisteredUser user = registerUser();

        given()
            .header("Authorization", "Bearer " + user.token())
        .when()
            .get("/api/users/me/events")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.content", instanceOf(java.util.List.class))
            .body("data.totalElements", greaterThanOrEqualTo(0));
    }

    @Test
    void getMyEventsShouldReturn401WithoutToken() {
        given()
        .when()
            .get("/api/users/me/events")
        .then()
            .statusCode(401);
    }

    // ── GET /api/users/{userId} ───────────────────────────────────────────────

    @Test
    void getPublicProfileShouldReturn200WithPublicData() {
        RegisteredUser user = registerUser();

        given()
        .when()
            .get("/api/users/" + user.id())
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.id", equalTo(user.id().toString()))
            .body("data.username", notNullValue());
    }

    @Test
    void getPublicProfileShouldNotExposeEmail() {
        RegisteredUser user = registerUser();

        given()
        .when()
            .get("/api/users/" + user.id())
        .then()
            .statusCode(200)
            .body("data.email", nullValue());
    }

    @Test
    void getPublicProfileShouldReturn404ForNonexistentUser() {
        given()
        .when()
            .get("/api/users/" + UUID.randomUUID())
        .then()
            .statusCode(404);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private record RegisteredUser(UUID id, String token) {}

    private RegisteredUser registerUser() {
        String suffix = TestFixtures.uniqueSuffix();
        String email = "user_" + suffix + "@test.com";

        io.restassured.response.Response reg = given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", email,
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .extract().response();

        UUID id = UUID.fromString(reg.path("data.userId").toString());
        String token = reg.path("data.token");
        return new RegisteredUser(id, token);
    }
}
