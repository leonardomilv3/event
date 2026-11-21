package com.eventing.shared.exception;

import com.eventing.shared.i18n.LocaleResolver;
import com.eventing.shared.i18n.MessageService;
import com.eventing.shared.response.ApiResponse;
import jakarta.inject.Inject;
import jakarta.persistence.EntityExistsException;
import jakarta.persistence.EntityNotFoundException;
import jakarta.validation.ConstraintViolationException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.List;
import java.util.Locale;

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

        @Inject
        MessageService messages;
        @Inject
        LocaleResolver localeResolver;

        @Override
        public Response toResponse(Exception exception) {
                Locale locale = localeResolver.resolve();

                return switch (exception) {
                        case ApiException e -> {
                                String message = e.getMessageKey() != null
                                                ? messages.get(e.getMessageKey(), locale, e.getMessageArgs())
                                                : e.getFallback();
                                yield json(e.getStatus(), e.getErrorCode() != null
                                                ? ApiResponse.errorWithCode(message, e.getErrorCode())
                                                : ApiResponse.error(message));
                        }

                        case ConstraintViolationException e -> {
                                List<String> errors = e.getConstraintViolations().stream()
                                                .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                                                .toList();
                                yield json(Response.Status.BAD_REQUEST,
                                                ApiResponse.validationErrors(messages.get("error.validation", locale),
                                                                errors));
                        }

                        case EntityExistsException e -> json(Response.Status.CONFLICT,
                                        ApiResponse.error(messages.get("error.resourceExists", locale)));

                        case EntityNotFoundException e -> json(Response.Status.NOT_FOUND,
                                        ApiResponse.error(messages.get("error.resourceNotFound", locale)));

                        case NotFoundException e -> json(Response.Status.NOT_FOUND,
                                        ApiResponse.error(messages.get("error.resourceNotFound", locale)));

                        case SecurityException e -> json(Response.Status.UNAUTHORIZED,
                                        ApiResponse.error(messages.get("error.unauthorized", locale)));

                        case WebApplicationException e ->
                                json(Response.Status.fromStatusCode(e.getResponse().getStatus()),
                                                ApiResponse.error(e.getMessage() != null ? e.getMessage()
                                                                : messages.get("error.badRequest", locale)));

                        default -> json(Response.Status.INTERNAL_SERVER_ERROR,
                                        ApiResponse.error(messages.get("error.internal", locale)));
                };
        }

        private Response json(Response.Status status, ApiResponse<?> body) {
                return Response.status(status).entity(body).type(MediaType.APPLICATION_JSON).build();
        }
}