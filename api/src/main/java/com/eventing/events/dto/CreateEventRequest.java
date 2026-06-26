package com.eventing.events.dto;

import com.eventing.events.domain.EventVisibility;
import jakarta.validation.constraints.*;
import java.time.OffsetDateTime;

public record CreateEventRequest(
        @NotBlank @Size(max = 200) String title,
        String description,
        @NotBlank @Size(max = 50) String category,
        EventVisibility visibility,
        @DecimalMin("-90.0") @DecimalMax("90.0") Double latitude,
        @DecimalMin("-180.0") @DecimalMax("180.0") Double longitude,
        @Size(max = 200) String locationName,
        String address,
        @NotNull @Future OffsetDateTime startsAt,
        OffsetDateTime endsAt,
        @Positive Integer maxParticipants
) {
}

    
