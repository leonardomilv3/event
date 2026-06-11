package com.eventing.participants.dto;

import com.eventing.participants.domain.ParticipantStatus;
import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipantResponse(
        UUID userId,
        String username,
        String displayName,
        String avatarUrl,
        ParticipantStatus status,
        LocalDateTime joinedAt
) {}
