package com.eventing.participants.dto;

import com.eventing.participants.domain.ParticipantStatus;
import com.eventing.users.dto.UserDto;
import java.time.LocalDateTime;
import java.util.UUID;

public record ParticipantDto(
        UUID id,
        UUID eventId,
        UserDto user,
        ParticipantStatus status,
        LocalDateTime joinedAt
) {}
