package com.eventing.shared;

import com.eventing.shared.exception.ApiException;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.*;

class ApiExceptionTest {

    @Test
    void notFoundShouldReturn404WithCorrectMessage() {
        ApiException ex = ApiException.notFound("Evento");

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
        assertEquals("Evento não encontrado(a)", ex.getMessage());
        assertNull(ex.getErrorCode());
    }

    @Test
    void badRequestShouldReturn400() {
        ApiException ex = ApiException.badRequest("campo inválido");

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
        assertEquals("campo inválido", ex.getMessage());
        assertNull(ex.getErrorCode());
    }

    @Test
    void unauthorizedShouldReturn401() {
        ApiException ex = ApiException.unauthorized();

        assertEquals(Response.Status.UNAUTHORIZED, ex.getStatus());
        assertNotNull(ex.getMessage());
    }

    @Test
    void forbiddenShouldReturn403() {
        ApiException ex = ApiException.forbidden();

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
        assertNotNull(ex.getMessage());
    }

    @Test
    void conflictShouldReturn409() {
        ApiException ex = ApiException.conflict("recurso duplicado");

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
        assertEquals("recurso duplicado", ex.getMessage());
        assertNull(ex.getErrorCode());
    }

    @Test
    void alreadyParticipantShouldReturn409WithErrorCode() {
        ApiException ex = ApiException.alreadyParticipant();

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
        assertEquals("ALREADY_PARTICIPANT", ex.getErrorCode());
        assertNotNull(ex.getMessage());
    }

    @Test
    void constructorWithErrorCodeShouldPreserveAllFields() {
        ApiException ex = new ApiException("msg", Response.Status.BAD_REQUEST, "CUSTOM_CODE");

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
        assertEquals("msg", ex.getMessage());
        assertEquals("CUSTOM_CODE", ex.getErrorCode());
    }

    @Test
    void exceptionShouldExtendRuntimeException() {
        ApiException ex = ApiException.notFound("X");
        assertInstanceOf(RuntimeException.class, ex);
    }
}
