package com.eventing.events;

import java.time.OffsetDateTime;
import java.util.UUID;

public record NativeEventRow(
        UUID id,
        UUID creatorId,
        String creatorUsername,
        String title,
        String description,
        String category,
        String visibility,
        String status,
        String coverImageUrl,
        String locationName,
        String address,
        Double latitude,
        Double longitude,
        OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        Integer maxParticipants,
        Integer participantCount,
        OffsetDateTime createdAt,
        OffsetDateTime updatedAt,
        Double distanceKm
) {}
