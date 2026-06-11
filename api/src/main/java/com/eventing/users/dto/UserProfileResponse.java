package com.eventing.users.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record UserProfileResponse(
        UUID id,
        String email,
        String username,
        String displayName,
        String avatarUrl,
        String bio,
        String city,
        List<String> interests,
        LocalDateTime createdAt
) {}
