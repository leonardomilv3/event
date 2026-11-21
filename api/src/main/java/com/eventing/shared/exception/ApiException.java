package com.eventing.shared.exception;

import jakarta.ws.rs.core.Response;

/**
 * Domain exception carrying:
 * - messageKey : i18n key resolved by
 * {@link com.eventing.shared.i18n.MessageService}
 * - messageArgs : MessageFormat placeholders
 * - fallback : English message used when the key is missing (never show raw
 * keys to clients)
 * - errorCode : stable machine-readable code (frontend can map to its own i18n
 * if desired)
 * - status : HTTP status
 */
public class ApiException extends RuntimeException {

    private final Response.Status status;
    private final String errorCode;
    private final String messageKey;
    private final Object[] messageArgs;
    private final String fallback;

    public ApiException(String fallback, Response.Status status) {
        this(null, null, fallback, status, null);
    }

    public ApiException(String fallback, Response.Status status, String errorCode) {
        this(null, null, fallback, status, errorCode);
    }

    public ApiException(String messageKey, Object[] messageArgs, String fallback,
            Response.Status status, String errorCode) {
        super(fallback);
        this.messageKey = messageKey;
        this.messageArgs = messageArgs;
        this.fallback = fallback;
        this.status = status;
        this.errorCode = errorCode;
    }

    // ── Factories ────────────────────────────────────────────────────────

    /**
     * 404 for a missing resource. The argument is a resource key
     * ({@code "event"}, {@code "user"}, {@code "participant"}, {@code "follow"})
     * resolved to {@code error.<key>.notFound}.
     */
    public static ApiException notFound(String resourceKey) {
        return new ApiException(
                "error." + resourceKey + ".notFound",
                null,
                "Not found",
                Response.Status.NOT_FOUND,
                "NOT_FOUND");
    }

    public static ApiException badRequest(String messageKey, String fallback) {
        return new ApiException(messageKey, null, fallback,
                Response.Status.BAD_REQUEST, "BAD_REQUEST");
    }

    public static ApiException unauthorized() {
        return new ApiException("error.unauthorized", null, "Unauthorized",
                Response.Status.UNAUTHORIZED, "UNAUTHORIZED");
    }

    public static ApiException forbidden() {
        return new ApiException("error.forbidden", null, "Access denied",
                Response.Status.FORBIDDEN, "FORBIDDEN");
    }

    public static ApiException conflict(String messageKey, String fallback) {
        return new ApiException(messageKey, null, fallback,
                Response.Status.CONFLICT, "CONFLICT");
    }

    public static ApiException alreadyParticipant() {
        return new ApiException("error.participant.alreadyJoined", null,
                "User is already a participant of this event",
                Response.Status.CONFLICT, "ALREADY_PARTICIPANT");
    }

    // ── Accessors ────────────────────────────────────────────────────────

    public Response.Status getStatus() {
        return status;
    }

    public String getErrorCode() {
        return errorCode;
    }

    public String getMessageKey() {
        return messageKey;
    }

    public Object[] getMessageArgs() {
        return messageArgs;
    }

    public String getFallback() {
        return fallback;
    }
}