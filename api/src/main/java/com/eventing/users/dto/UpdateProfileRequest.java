package com.eventing.users.dto;

import jakarta.validation.constraints.Size;
import java.util.List;

public record UpdateProfileRequest(
        @Size(max = 100) String displayName,
        String bio,
        @Size(max = 100) String city,
        List<String> interests
) {}
