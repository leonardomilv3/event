package com.eventing.participants;

import java.time.OffsetDateTime;
import java.util.UUID;

public record ApprovedParticipantRow(
        UUID userId,
        String username,
        String displayName,
        String avatarUrl,
        String status,
        OffsetDateTime joinedAt
) {}
