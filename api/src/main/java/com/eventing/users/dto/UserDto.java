package com.eventing.users.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDto(
        UUID id,
        String email,
        String username,
        String role,
        LocalDateTime createdAt
) {}
