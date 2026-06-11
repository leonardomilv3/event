package com.eventing.users;

import com.eventing.shared.exception.ApiException;
import com.eventing.users.domain.User;
import com.eventing.users.dto.CreateUserRequest;
import com.eventing.users.dto.UserDto;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
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

    @Transactional
    public UserDto create(CreateUserRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Email já cadastrado");
        }
        User user = new User();
        user.email = request.email();
        user.name = request.name();
        // TODO: hash password — use BCrypt or Argon2 antes de salvar
        user.passwordHash = request.password();
        userRepository.persist(user);
        return userMapper.toDto(user);
    }
}