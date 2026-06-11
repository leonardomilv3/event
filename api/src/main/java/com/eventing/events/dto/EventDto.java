package com.eventing.events.dto;

import com.eventing.events.domain.EventStatus;
import com.eventing.users.dto.UserDto;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventDto(
        UUID id,
        String title,
        String description,
        String category,
        LocalDateTime startAt,
        LocalDateTime endAt,
        String location,
        BigDecimal price,
        Integer maxParticipants,
        String imageUrl,
        EventStatus status,
        UserDto organizer,
        LocalDateTime createdAt
) {}
