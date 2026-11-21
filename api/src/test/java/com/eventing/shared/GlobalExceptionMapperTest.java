package com.eventing.shared;

import com.eventing.shared.exception.ApiException;
import com.eventing.shared.exception.GlobalExceptionMapper;
import com.eventing.shared.i18n.LocaleResolver;
import com.eventing.shared.i18n.MessageService;
import com.eventing.shared.response.ApiResponse;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolation;
import jakarta.validation.ConstraintViolationException;
import jakarta.validation.Path;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Mockito;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;

import java.util.Locale;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
class GlobalExceptionMapperTest {

    @Mock
    MessageService messages;
    @Mock
    LocaleResolver localeResolver;
    @InjectMocks
    GlobalExceptionMapper mapper;

    @BeforeEach
    void setUp() {
        when(localeResolver.resolve()).thenReturn(Locale.ENGLISH);

        // Stub both overloads with a small resolver table that mirrors the real bundle.
        lenient().when(messages.get(anyString(), any(Locale.class), any()))
                .thenAnswer(inv -> resolve(inv.getArgument(0)));
        lenient().when(messages.get(anyString(), any(Locale.class)))
                .thenAnswer(inv -> resolve(inv.getArgument(0)));
    }

    private static String resolve(String key) {
        return switch (key) {
            case "error.event.notFound" -> "Event not found";
            case "error.participant.alreadyJoined" -> "User is already a participant of this event";
            case "error.unauthorized" -> "Unauthorized";
            case "error.forbidden" -> "Access denied";
            case "error.validation" -> "Validation error";
            case "error.resourceExists" -> "Resource already exists";
            case "error.resourceNotFound" -> "Resource not found";
            case "error.internal" -> "Internal server error";
            case "error.badRequest" -> "Invalid request";
            default -> key;
        };
    }

    @Test
    void shouldResolveApiExceptionMessageThroughMessageService() {
        Response response = mapper.toResponse(ApiException.notFound("event"));

        assertEquals(404, response.getStatus());
        assertJson(response);
        ApiResponse<?> body = body(response);
        assertFalse(body.success());
        assertEquals("Event not found", body.message());
        assertEquals("NOT_FOUND", body.errorCode());
    }

    @Test
    void shouldReturn409ForApiExceptionConflict() {
        Response response = mapper.toResponse(
                ApiException.conflict("error.test.dup", "Duplicate"));

        assertEquals(409, response.getStatus());
        assertJson(response);
        assertEquals("CONFLICT", body(response).errorCode());
    }

    @Test
    void shouldReturn401ForApiExceptionUnauthorized() {
        Response response = mapper.toResponse(ApiException.unauthorized());

        assertEquals(401, response.getStatus());
        assertJson(response);
        assertEquals("Unauthorized", body(response).message());
    }

    @Test
    void shouldReturn403ForApiExceptionForbidden() {
        Response response = mapper.toResponse(ApiException.forbidden());

        assertEquals(403, response.getStatus());
        assertJson(response);
        assertEquals("Access denied", body(response).message());
    }

    @Test
    void shouldIncludeErrorCodeWhenPresent() {
        Response response = mapper.toResponse(ApiException.alreadyParticipant());

        assertEquals(409, response.getStatus());
        assertEquals("ALREADY_PARTICIPANT", body(response).errorCode());
        assertEquals(
                "User is already a participant of this event",
                body(response).message());
    }

    @Test
    void shouldReturn400ForConstraintViolationWithErrorList() {
        ConstraintViolation<?> violation = Mockito.mock(ConstraintViolation.class);
        Path path = Mockito.mock(Path.class);
        when(path.toString()).thenReturn("campo");
        when(violation.getPropertyPath()).thenReturn(path);
        when(violation.getMessage()).thenReturn("must not be blank");
        ConstraintViolationException ex = new ConstraintViolationException(Set.of(violation));

        Response response = mapper.toResponse(ex);

        assertEquals(400, response.getStatus());
        assertJson(response);
        ApiResponse<?> body = body(response);
        assertFalse(body.success());
        assertEquals("Validation error", body.message());
        assertEquals("VALIDATION_ERROR", body.errorCode());
        assertNotNull(body.errors());
        assertFalse(body.errors().isEmpty());
        assertTrue(body.errors().getFirst().contains("must not be blank"));
    }

    @Test
    void shouldReturn404ForEntityNotFoundException() {
        Response response = mapper.toResponse(new EntityNotFoundException("not found"));

        assertEquals(404, response.getStatus());
        assertJson(response);
        assertEquals("Resource not found", body(response).message());
    }

    @Test
    void shouldReturn409ForEntityExistsException() {
        Response response = mapper.toResponse(new EntityExistsException("already exists"));

        assertEquals(409, response.getStatus());
        assertJson(response);
        assertEquals("Resource already exists", body(response).message());
    }

    @Test
    void shouldReturn404ForJaxrsNotFoundException() {
        Response response = mapper.toResponse(new NotFoundException("route not found"));

        assertEquals(404, response.getStatus());
        assertJson(response);
        assertEquals("Resource not found", body(response).message());
    }

    @Test
    void shouldReturn500ForGenericRuntimeException() {
        Response response = mapper.toResponse(new RuntimeException("boom"));

        assertEquals(500, response.getStatus());
        assertJson(response);
        assertFalse(body(response).success());
        assertEquals("Internal server error", body(response).message());
    }

    @Test
    void shouldTranslateLocaleFromResolver() {
        // Prova que o mapper delega a resolução para o LocaleResolver, não usa Locale
        // default.
        when(localeResolver.resolve()).thenReturn(Locale.forLanguageTag("pt-BR"));

        Response response = mapper.toResponse(ApiException.unauthorized());

        // O mock devolve o mesmo texto para qualquer locale — o ponto é verificar
        // que resolve() foi chamado e o locale foi repassado para messages.get.
        assertEquals(401, response.getStatus());
        Mockito.verify(messages).get(eq("error.unauthorized"), eq(Locale.forLanguageTag("pt-BR")), any());
    }

    // ── helpers ─────────────────────────────────────────────────────────

    private static void assertJson(Response response) {
        assertNotNull(response.getMediaType());
        assertEquals(MediaType.APPLICATION_JSON, response.getMediaType().toString());
    }

    private static ApiResponse<?> body(Response response) {
        return (ApiResponse<?>) response.getEntity();
    }
}