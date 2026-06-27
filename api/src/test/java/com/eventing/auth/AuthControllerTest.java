package com.eventing.auth;

import com.eventing.TestFixtures;
import io.quarkus.test.junit.QuarkusTest;
import io.restassured.http.ContentType;
import org.junit.jupiter.api.Test;

import java.util.Map;

import static io.restassured.RestAssured.given;
import static org.hamcrest.Matchers.*;

@QuarkusTest
class AuthControllerTest {

    // ── POST /api/auth/register ───────────────────────────────────────────────

    @Test
    void registerShouldReturn201WithToken() {
        String suffix = TestFixtures.uniqueSuffix();
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(201)
            .body("success", is(true))
            .body("data.token", notNullValue())
            .body("data.userId", notNullValue())
            .body("data.username", equalTo("user_" + suffix));
    }

    @Test
    void registerShouldReturn409OnDuplicateEmail() {
        String suffix = TestFixtures.uniqueSuffix();
        // Primeiro registro
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when().post("/api/auth/register").then().statusCode(201);

        // Segundo com mesmo email
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "outro_" + suffix,
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(409)
            .body("success", is(false))
            .body("message", notNullValue());
    }

    @Test
    void registerShouldReturn400WhenEmailMissing() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "username", "someuser",
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(400);
    }

    @Test
    void registerShouldReturn400ForShortPassword() {
        // Quarkus REST intercepta @Valid antes do GlobalExceptionMapper — só verificamos o status
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "test@test.com",
                "username", "testuser",
                "password", "1234567" // 7 chars — viola @Size(min=8)
            ))
        .when()
            .post("/api/auth/register")
        .then()
            .statusCode(400);
    }

    // ── POST /api/auth/login ──────────────────────────────────────────────────

    @Test
    void loginShouldReturn200WithToken() {
        String suffix = TestFixtures.uniqueSuffix();
        // Registra primeiro
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when().post("/api/auth/register").then().statusCode(201);

        // Faz login
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.token", notNullValue())
            .body("data.expiresIn", equalTo(86400));
    }

    @Test
    void loginShouldReturn401ForWrongPassword() {
        String suffix = TestFixtures.uniqueSuffix();
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when().post("/api/auth/register").then().statusCode(201);

        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "password", "senhaerrada"
            ))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("success", is(false));
    }

    @Test
    void loginShouldReturn401ForNonexistentEmail() {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "nobody_" + TestFixtures.uniqueSuffix() + "@test.com",
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/login")
        .then()
            .statusCode(401)
            .body("success", is(false));
    }

    // ── GET /api/auth/me ──────────────────────────────────────────────────────

    @Test
    void meShouldReturn200WithValidToken() {
        String suffix = TestFixtures.uniqueSuffix();
        String token = obtainToken(suffix);

        given()
            .header("Authorization", "Bearer " + token)
        .when()
            .get("/api/auth/me")
        .then()
            .statusCode(200)
            .body("success", is(true))
            .body("data.username", equalTo("user_" + suffix));
    }

    @Test
    void meShouldReturn401WithoutToken() {
        given()
        .when()
            .get("/api/auth/me")
        .then()
            .statusCode(401);
    }

    @Test
    void meShouldReturn401WithInvalidToken() {
        given()
            .header("Authorization", "Bearer token.invalido.aqui")
        .when()
            .get("/api/auth/me")
        .then()
            .statusCode(401);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private String obtainToken(String suffix) {
        given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "username", "user_" + suffix,
                "password", "senha12345"
            ))
        .when().post("/api/auth/register").then().statusCode(201);

        return given()
            .contentType(ContentType.JSON)
            .body(Map.of(
                "email", "user_" + suffix + "@test.com",
                "password", "senha12345"
            ))
        .when()
            .post("/api/auth/login")
        .then()
            .extract().path("data.token");
    }
}
