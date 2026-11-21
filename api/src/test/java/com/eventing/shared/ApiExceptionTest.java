package com.eventing.shared;

import com.eventing.shared.exception.ApiException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiExceptionTest {

    @Test
    void notFoundShouldCarryKeyFallbackAndErrorCode() {
        ApiException ex = ApiException.notFound("event");

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
        assertEquals("error.event.notFound", ex.getMessageKey());
        assertEquals("Not found", ex.getMessage()); // fallback EN
        assertEquals("NOT_FOUND", ex.getErrorCode());
    }

    @Test
    void badRequestShouldCarryMessageKeyAndFallback() {
        ApiException ex = ApiException.badRequest(
                "error.test.invalidField",
                "Invalid field");

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
        assertEquals("error.test.invalidField", ex.getMessageKey());
        assertEquals("Invalid field", ex.getMessage());
        assertEquals("BAD_REQUEST", ex.getErrorCode());
    }

    @Test
    void unauthorizedShouldReturn401() {
        ApiException ex = ApiException.unauthorized();

        assertEquals(Response.Status.UNAUTHORIZED, ex.getStatus());
        assertEquals("error.unauthorized", ex.getMessageKey());
        assertEquals("Unauthorized", ex.getMessage());
        assertEquals("UNAUTHORIZED", ex.getErrorCode());
    }

    @Test
    void forbiddenShouldReturn403() {
        ApiException ex = ApiException.forbidden();

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
        assertEquals("error.forbidden", ex.getMessageKey());
        assertEquals("Access denied", ex.getMessage());
        assertEquals("FORBIDDEN", ex.getErrorCode());
    }

    @Test
    void conflictShouldCarryMessageKeyAndFallback() {
        ApiException ex = ApiException.conflict(
                "error.test.duplicate",
                "Duplicate resource");

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
        assertEquals("error.test.duplicate", ex.getMessageKey());
        assertEquals("Duplicate resource", ex.getMessage());
        assertEquals("CONFLICT", ex.getErrorCode());
    }

    @Test
    void alreadyParticipantShouldReturn409WithErrorCode() {
        ApiException ex = ApiException.alreadyParticipant();

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
        assertEquals("ALREADY_PARTICIPANT", ex.getErrorCode());
        assertEquals("error.participant.alreadyJoined", ex.getMessageKey());
        assertEquals("User is already a participant of this event", ex.getMessage());
    }

    @Test
    void legacyConstructorWithErrorCodeShouldPreserveFallbackAndCode() {
        // Mantido para callers antigos que ainda usam (fallback, status, errorCode).
        ApiException ex = new ApiException("msg", Response.Status.BAD_REQUEST, "CUSTOM_CODE");

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
        assertEquals("msg", ex.getMessage());
        assertEquals("CUSTOM_CODE", ex.getErrorCode());
        assertNull(ex.getMessageKey()); // sem i18n key: usa fallback cru
    }

    @Test
    void fullConstructorShouldExposeAllFields() {
        ApiException ex = new ApiException(
                "error.test.key",
                new Object[] { "arg" },
                "Fallback",
                Response.Status.INTERNAL_SERVER_ERROR,
                "TEST_CODE");

        assertEquals(Response.Status.INTERNAL_SERVER_ERROR, ex.getStatus());
        assertEquals("error.test.key", ex.getMessageKey());
        assertArrayEquals(new Object[] { "arg" }, ex.getMessageArgs());
        assertEquals("Fallback", ex.getMessage());
        assertEquals("TEST_CODE", ex.getErrorCode());
    }

    @Test
    void exceptionShouldExtendRuntimeException() {
        ApiException ex = ApiException.notFound("event");
        assertInstanceOf(RuntimeException.class, ex);
    }
}