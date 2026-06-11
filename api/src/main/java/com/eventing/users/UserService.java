package com.eventing.users;

import com.eventing.shared.exception.ApiException;
import com.eventing.users.domain.User;
import com.eventing.users.dto.UserDto;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    public UserDto findById(UUID id) {
        User user = userRepository.findById(id);
        if (user == null) throw ApiException.notFound("Usuário");
        return userMapper.toDto(user);
    }
}
