package com.eventing.social.dto;

import com.eventing.users.dto.UserDto;
import java.time.LocalDateTime;
import java.util.UUID;

public record FollowDto(
        UUID id,
        UserDto follower,
        UserDto following,
        LocalDateTime createdAt
) {}
