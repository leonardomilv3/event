package com.eventing.users.dto;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

/**
 * DTO do perfil público de um usuário (GET /api/users/{userId}).
 * Estruturalmente sem campo email — não depende de configuração de
 * serialização (non-null) para evitar vazamento de PII.
 */
public record UserPublicProfileResponse(
        UUID id,
        String username,
        String displayName,
        String avatarUrl,
        String bio,
        String city,
        List<String> interests,
        LocalDateTime createdAt
) {}
