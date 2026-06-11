package com.eventing.shared.response;

import java.util.List;

public record ApiResponse<T>(T data, String message, boolean success, List<String> errors) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, true, null);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(null, null, true, null);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(null, message, false, null);
    }

    public static ApiResponse<Void> validationErrors(List<String> errors) {
        return new ApiResponse<>(null, "Erro de validação", false, errors);
    }
}
