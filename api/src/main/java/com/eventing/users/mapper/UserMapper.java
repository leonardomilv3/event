package com.eventing.users.mapper;

import com.eventing.users.domain.User;
import com.eventing.users.dto.UserDto;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class UserMapper {

    public UserDto toDto(User user) {
        if (user == null) return null;
        return new UserDto(
                user.id,
                user.email,
                user.name,
                user.avatarUrl,
                user.createdAt
        );
    }
}
