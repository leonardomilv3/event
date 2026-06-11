package com.eventing.shared.exception;

import com.eventing.shared.response.ApiResponse;
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

@Provider
public class GlobalExceptionMapper implements ExceptionMapper<Exception> {

    @Override
    public Response toResponse(Exception exception) {
        return switch (exception) {
            case ApiException e -> Response
                    .status(e.getStatus())
                    .entity(ApiResponse.error(e.getMessage()))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            case ConstraintViolationException e -> {
                List<String> errors = e.getConstraintViolations().stream()
                        .map(v -> v.getPropertyPath() + ": " + v.getMessage())
                        .toList();
                yield Response
                        .status(Response.Status.BAD_REQUEST)
                        .entity(ApiResponse.validationErrors(errors))
                        .type(MediaType.APPLICATION_JSON)
                        .build();
            }

            case EntityExistsException e -> Response
                    .status(Response.Status.CONFLICT)
                    .entity(ApiResponse.error("Recurso já existe"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            case EntityNotFoundException e -> Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Recurso não encontrado"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            case NotFoundException e -> Response
                    .status(Response.Status.NOT_FOUND)
                    .entity(ApiResponse.error("Recurso não encontrado"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            case SecurityException e -> Response
                    .status(Response.Status.UNAUTHORIZED)
                    .entity(ApiResponse.error("Não autorizado"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            case WebApplicationException e -> Response
                    .status(e.getResponse().getStatus())
                    .entity(ApiResponse.error(e.getMessage()))
                    .type(MediaType.APPLICATION_JSON)
                    .build();

            default -> Response
                    .status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(ApiResponse.error("Erro interno do servidor"))
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        };
    }
}
