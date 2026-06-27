package com.eventing.social;

import com.eventing.TestFixtures;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;
import java.util.UUID;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class SocialControllerTest {

    // ── GET /api/social/users/{userId}/followers ──────────────────────────────

    @Test
    void getFollowersShouldReturn200WithEmptyListForNewUser() {
        RegisteredUser user = registerUser();

        given()
        .when()
            .get("/api/social/users/" + user.id() + "/followers")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data", hasSize(0));
    }

    @Test
    void getFollowersShouldReturn200WithListAfterFollow() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(201);

        given()
        .when()
            .get("/api/social/users/" + userB.id() + "/followers")
        .then()
            .statusCode(200)
            .body("data", hasSize(greaterThanOrEqualTo(1)));
    }

    // ── GET /api/social/users/{userId}/following ──────────────────────────────

    @Test
    void getFollowingShouldReturn200WithEmptyListForNewUser() {
        RegisteredUser user = registerUser();

        given()
        .when()
            .get("/api/social/users/" + user.id() + "/following")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data", hasSize(0));
    }

    @Test
    void getFollowingShouldReturn200WithOneItemAfterFollow() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(201);

        given()
        .when()
            .get("/api/social/users/" + userA.id() + "/following")
        .then()
            .statusCode(200)
            .body("data", hasSize(greaterThanOrEqualTo(1)));
    }

    // ── POST /api/social/users/{userId}/follow ────────────────────────────────

    @Test
    void followShouldReturn201WithFollowDto() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(201)
            .body("success", is(true))
            .body("data.id", notNullValue())
            .body("data.follower", notNullValue())
            .body("data.following", notNullValue());
    }

    @Test
    void followShouldReturn401WithoutToken() {
        RegisteredUser userB = registerUser();

        given()
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(401);
    }

    @Test
    void followShouldReturn400WhenFollowingSelf() {
        RegisteredUser userA = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userA.id() + "/follow")
        .then()
            .statusCode(400);
    }

    @Test
    void followShouldReturn409WhenAlreadyFollowing() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(201);

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(409);
    }

    @Test
    void followShouldReturn404ForNonexistentUser() {
        RegisteredUser userA = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + UUID.randomUUID() + "/follow")
        .then()
            .statusCode(404);
    }

    // ── DELETE /api/social/users/{userId}/follow ──────────────────────────────

    @Test
    void unfollowShouldReturn204AfterFollow() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .post("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(201);

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(204);
    }

    @Test
    void unfollowShouldReturn401WithoutToken() {
        RegisteredUser userB = registerUser();

        given()
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/social/users/" + userB.id() + "/follow")
        .then()
            .statusCode(401);
    }

    @Test
    void unfollowShouldReturn404WhenNotFollowing() {
        RegisteredUser userA = registerUser();
        RegisteredUser userB = registerUser();

        given()
            .header("Authorization", "Bearer " + userA.token())
            .contentType(ContentType.JSON)
        .when()
            .delete("/api/social/users/" + userB.id() + "/follow")
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

        UUID id = UUID.fromString(reg.path("data.userId"));
        String token = reg.path("data.token");
        return new RegisteredUser(id, token);
    }
}
