package com.eventing.shared;

import com.eventing.shared.exception.ApiException;
import com.eventing.shared.exception.GlobalExceptionMapper;
import com.eventing.shared.response.ApiResponse;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.when;

class GlobalExceptionMapperTest {

    private final GlobalExceptionMapper mapper = new GlobalExceptionMapper();

    @Test
    void shouldReturn404ForApiExceptionNotFound() {
        ApiException ex = ApiException.notFound("Evento");
        Response response = mapper.toResponse(ex);

        assertEquals(404, response.getStatus());
        assertJson(response);
        ApiResponse<?> body = body(response);
        assertFalse(body.success());
        assertNotNull(body.message());
    }

    @Test
    void shouldReturn409ForApiExceptionConflict() {
        Response response = mapper.toResponse(ApiException.conflict("Já existe"));

        assertEquals(409, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldReturn401ForApiExceptionUnauthorized() {
        Response response = mapper.toResponse(ApiException.unauthorized());

        assertEquals(401, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldReturn403ForApiExceptionForbidden() {
        Response response = mapper.toResponse(ApiException.forbidden());

        assertEquals(403, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldIncludeErrorCodeWhenPresent() {
        ApiException ex = ApiException.alreadyParticipant();
        Response response = mapper.toResponse(ex);

        assertEquals(409, response.getStatus());
        assertEquals("ALREADY_PARTICIPANT", body(response).errorCode());
    }

    @Test
    void shouldReturn400ForConstraintViolationWithErrorList() {
        ConstraintViolation<?> violation = Mockito.mock(ConstraintViolation.class);
        Path path = Mockito.mock(Path.class);
        when(path.toString()).thenReturn("campo");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("não pode ser vazio");
        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        Response response = mapper.toResponse(ex);

        assertEquals(400, response.getStatus());
        assertJson(response);
        ApiResponse<?> body = body(response);
        assertFalse(body.success());
        assertNotNull(body.errors());
        assertFalse(body.errors().isEmpty());
        assertTrue(body.errors().getFirst().contains("não pode ser vazio"));
    }

    @Test
    void shouldReturn404ForEntityNotFoundException() {
        Response response = mapper.toResponse(new EntityNotFoundException("not found"));

        assertEquals(404, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldReturn409ForEntityExistsException() {
        Response response = mapper.toResponse(new EntityExistsException("already exists"));

        assertEquals(409, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldReturn404ForJaxrsNotFoundException() {
        Response response = mapper.toResponse(new NotFoundException("route not found"));

        assertEquals(404, response.getStatus());
        assertJson(response);
    }

    @Test
    void shouldReturn500ForGenericRuntimeException() {
        Response response = mapper.toResponse(new RuntimeException("erro inesperado"));

        assertEquals(500, response.getStatus());
        assertJson(response);
        assertFalse(body(response).success());
    }

    private static void assertJson(Response response) {
        assertNotNull(response.getMediaType());
        assertEquals(MediaType.APPLICATION_JSON, response.getMediaType().toString());
    }

    private static ApiResponse<?> body(Response response) {
        return (ApiResponse<?>) response.getEntity();
    }
}
