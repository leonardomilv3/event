package com.eventing.events;

import java.time.LocalDateTime;
import java.util.UUID;

public record SitemapEventRow(UUID id, LocalDateTime updatedAt) {}
