package com.eventing.events.dto;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record CreateEventRequest(
        @NotBlank String title,
        String description,
        @NotBlank String category,
        @NotNull @Future LocalDateTime startAt,
        @NotNull @Future LocalDateTime endAt,
        String location,
        @Positive BigDecimal price,
        @Positive Integer maxParticipants,
        String imageUrl
) {}
