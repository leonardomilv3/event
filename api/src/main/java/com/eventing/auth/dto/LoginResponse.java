package com.eventing.auth.dto;

import com.eventing.users.dto.UserDto;

public record LoginResponse(
        String accessToken,
        String tokenType,
        long expiresIn,
        UserDto user
) {
    public static LoginResponse of(String token, long expiresIn, UserDto user) {
        return new LoginResponse(token, "Bearer", expiresIn, user);
    }
}
