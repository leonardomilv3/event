package com.eventing.shared.response;

public record ApiResponse<T>(T data, String message, boolean success) {

    public static <T> ApiResponse<T> ok(T data) {
        return new ApiResponse<>(data, null, true);
    }

    public static ApiResponse<Void> ok() {
        return new ApiResponse<>(null, null, true);
    }

    public static ApiResponse<Void> error(String message) {
        return new ApiResponse<>(null, message, false);
    }
}
