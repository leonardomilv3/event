package com.eventing.auth;

import com.eventing.auth.dto.LoginRequest;
import com.eventing.auth.dto.LoginResponse;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.shared.config.AppConfig;
import com.eventing.shared.exception.ApiException;
import com.eventing.users.UserRepository;
import com.eventing.users.UserService;
import com.eventing.users.domain.User;
import com.eventing.users.dto.CreateUserRequest;
import com.eventing.users.dto.UserDto;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    UserService userService;

    @Inject
    UserMapper userMapper;

    @Inject
    AppConfig appConfig;

    @Transactional
    public LoginResponse register(RegisterRequest request) {
        UserDto user = userService.create(
                new CreateUserRequest(request.email(), request.name(), request.password())
        );
        // TODO: gerar token JWT usando io.smallrye.jwt.build.Jwt
        String token = "TODO_generate_jwt_for_" + user.id();
        return LoginResponse.of(token, appConfig.getJwtLifespanSeconds(), user);
    }

    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(ApiException::unauthorized);
        // TODO: verificar hash da senha (BCrypt/Argon2)
        // TODO: gerar token JWT usando io.smallrye.jwt.build.Jwt
        String token = "TODO_generate_jwt_for_" + user.id;
        return LoginResponse.of(token, appConfig.getJwtLifespanSeconds(), userMapper.toDto(user));
    }
}
