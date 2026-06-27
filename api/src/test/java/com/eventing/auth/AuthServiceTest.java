package com.eventing.auth;

import com.eventing.TestFixtures;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.auth.dto.LoginRequest;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.shared.exception.ApiException;
import com.eventing.users.UserRepository;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.validation.Validator;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class AuthServiceTest {

    @Inject AuthService authService;
    @Inject UserRepository userRepository;
    @Inject Validator validator;

    // ── REGISTRO ──────────────────────────────────────────────────────────────

    @Test
    @Transactional
    void shouldRegisterSuccessfully() {
        String suffix = TestFixtures.uniqueSuffix();
        AuthResponse response = authService.register(TestFixtures.registerRequest(suffix));

        assertNotNull(response.token());
        assertNotNull(response.userId());
        assertEquals("user_" + suffix, response.username());
        assertEquals(86400L, response.expiresIn());
    }

    @Test
    @Transactional
    void shouldRejectDuplicateEmail() {
        String suffix = TestFixtures.uniqueSuffix();
        authService.register(TestFixtures.registerRequest(suffix));

        var dup = new RegisterRequest(
            "user_" + suffix + "@test.com",
            "outro_" + suffix,
            "senha12345"
        );
        ApiException ex = assertThrows(ApiException.class, () -> authService.register(dup));
        assertEquals(Response.Status.CONFLICT, ex.getStatus());
    }

    @Test
    @Transactional
    void shouldRejectDuplicateUsername() {
        String suffix = TestFixtures.uniqueSuffix();
        authService.register(TestFixtures.registerRequest(suffix));

        var dup = new RegisterRequest(
            "outro_" + suffix + "@test.com",
            "user_" + suffix,
            "senha12345"
        );
        ApiException ex = assertThrows(ApiException.class, () -> authService.register(dup));
        assertEquals(Response.Status.CONFLICT, ex.getStatus());
    }

    @Test
    void shouldFailValidationForInvalidEmail() {
        var req = new RegisterRequest("not-an-email", "validuser", "senha12345");
        var violations = validator.validate(req);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getPropertyPath().toString().equals("email")));
    }

    @Test
    void shouldFailValidationForShortPassword() {
        var req = new RegisterRequest("valid@test.com", "validuser", "1234567"); // 7 chars
        var violations = validator.validate(req);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getPropertyPath().toString().equals("password")));
    }

    @Test
    void shouldFailValidationForShortUsername() {
        var req = new RegisterRequest("valid@test.com", "ab", "senha12345"); // 2 chars
        var violations = validator.validate(req);

        assertFalse(violations.isEmpty());
        assertTrue(violations.stream()
            .anyMatch(v -> v.getPropertyPath().toString().equals("username")));
    }

    // ── LOGIN ─────────────────────────────────────────────────────────────────

    @Test
    @Transactional
    void shouldLoginWithCorrectCredentials() {
        String suffix = TestFixtures.uniqueSuffix();
        authService.register(TestFixtures.registerRequest(suffix));

        var login = new LoginRequest("user_" + suffix + "@test.com", "senha12345");
        AuthResponse response = authService.login(login);

        assertNotNull(response.token());
        assertNotNull(response.userId());
        assertEquals("user_" + suffix, response.username());
    }

    @Test
    void shouldRejectLoginWithNonexistentEmail() {
        var login = new LoginRequest("nonexistent_" + TestFixtures.uniqueSuffix() + "@test.com", "senha12345");
        ApiException ex = assertThrows(ApiException.class, () -> authService.login(login));
        assertEquals(Response.Status.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    @Transactional
    void shouldRejectLoginWithWrongPassword() {
        String suffix = TestFixtures.uniqueSuffix();
        authService.register(TestFixtures.registerRequest(suffix));

        var login = new LoginRequest("user_" + suffix + "@test.com", "senhaerrada");
        ApiException ex = assertThrows(ApiException.class, () -> authService.login(login));
        assertEquals(Response.Status.UNAUTHORIZED, ex.getStatus());
    }

    @Test
    @Transactional
    void shouldRejectLoginForInactiveUser() {
        String suffix = TestFixtures.uniqueSuffix();
        AuthResponse registered = authService.register(TestFixtures.registerRequest(suffix));

        // Desativa o usuário diretamente via repositório
        var user = userRepository.findById(registered.userId());
        assertNotNull(user);
        user.active = false;
        userRepository.persist(user);

        var login = new LoginRequest("user_" + suffix + "@test.com", "senha12345");
        ApiException ex = assertThrows(ApiException.class, () -> authService.login(login));
        assertEquals(Response.Status.UNAUTHORIZED, ex.getStatus());
    }

    // ── TOKEN ─────────────────────────────────────────────────────────────────

    @Test
    @Transactional
    void shouldReturnTokenWithConfiguredLifespan() {
        String suffix = TestFixtures.uniqueSuffix();
        AuthResponse response = authService.register(TestFixtures.registerRequest(suffix));

        assertEquals(86400L, response.expiresIn());
    }

    @Test
    @Transactional
    void shouldReturnTokenWithUserIdAsSubject() {
        String suffix = TestFixtures.uniqueSuffix();
        AuthResponse response = authService.register(TestFixtures.registerRequest(suffix));

        // O JWT tem formato HEADER.PAYLOAD.SIGNATURE — decodifica o payload
        String payload = new String(Base64.getUrlDecoder().decode(
            response.token().split("\\.")[1]
        ));

        assertTrue(payload.contains(response.userId().toString()),
            "JWT subject deve conter o userId: " + response.userId());
    }
}
