package com.eventing.events.dto;

import com.eventing.events.domain.EventStatus;
import com.eventing.events.domain.EventVisibility;
import java.time.LocalDateTime;
import java.util.UUID;

public record EventResponse(
        UUID id,
        UUID creatorId,
        String creatorUsername,
        String title,
        String description,
        String category,
        EventVisibility visibility,
        EventStatus status,
        String coverImageUrl,
        String locationName,
        String address,
        Double latitude,
        Double longitude,
        LocalDateTime startsAt,
        LocalDateTime endsAt,
        Integer maxParticipants,
        int participantCount,
        Double distanceKm,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}
