package com.eventing.shared.response;

import java.util.List;

public record ApiResponse<T>(T data, String message, boolean success, List<String> errors, String errorCode) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, true, null, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(null, null, true, null, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(null, message, false, null, null);
    }

    public static ApiResponse<Void> errorWithCode(String message, String errorCode) {
        return new ApiResponse<>(null, message, false, null, errorCode);
    }

    public static ApiResponse<Void> validationErrors(List<String> errors) {
        return new ApiResponse<>(null, "Erro de validação", false, errors, null);
    }
}
