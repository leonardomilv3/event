package com.eventing.shared.exception;

import jakarta.ws.rs.core.Response;

public class ApiException extends RuntimeException {

    private final Response.Status status;
    private final String errorCode;

    public ApiException(String message, Response.Status status) {
        this(message, status, null);
    }

    public ApiException(String message, Response.Status status, String errorCode) {
        super(message);
        this.status = status;
        this.errorCode = errorCode;
    }

    public static ApiException notFound(String resource) {
        return new ApiException(resource + " não encontrado(a)", Response.Status.NOT_FOUND);
    }

    public static ApiException badRequest(String message) {
        return new ApiException(message, Response.Status.BAD_REQUEST);
    }

    public static ApiException unauthorized() {
        return new ApiException("Não autorizado", Response.Status.UNAUTHORIZED);
    }

    public static ApiException forbidden() {
        return new ApiException("Acesso negado", Response.Status.FORBIDDEN);
    }

    public static ApiException conflict(String message) {
        return new ApiException(message, Response.Status.CONFLICT);
    }

    public static ApiException alreadyParticipant() {
        return new ApiException("Usuário já é participante deste evento", Response.Status.CONFLICT, "ALREADY_PARTICIPANT");
    }

    public Response.Status getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }
}
