package com.eventing.auth.dto;

import java.util.UUID;

public record AuthResponse(
        String token,
        long expiresIn,
        UUID userId,
        String username
) {}
