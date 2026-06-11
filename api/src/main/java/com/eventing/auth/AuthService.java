package com.eventing.auth;

import com.eventing.auth.dto.AuthResponse;
import com.eventing.auth.dto.LoginRequest;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.shared.config.AppConfig;
import com.eventing.shared.exception.ApiException;
import com.eventing.users.UserRepository;
import com.eventing.users.domain.User;
import io.quarkus.elytron.security.common.BcryptUtil;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.Duration;
import java.util.Set;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    AppConfig appConfig;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw ApiException.conflict("Email já cadastrado");
        }
        if (userRepository.existsByUsername(request.username())) {
            throw ApiException.conflict("Username já utilizado");
        }
        User user = new User();
        user.email = request.email();
        user.username = request.username();
        user.passwordHash = BcryptUtil.bcryptHash(request.password());
        user.role = "user";
        user.active = true;
        userRepository.persist(user);
        return buildResponse(user);
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .filter(u -> u.active)
                .orElseThrow(ApiException::unauthorized);
        if (!BcryptUtil.matches(request.password(), user.passwordHash)) {
            throw ApiException.unauthorized();
        }
        return buildResponse(user);
    }

    private AuthResponse buildResponse(User user) {
        long lifespan = appConfig.getJwtLifespanSeconds();
        String token = Jwt.issuer(appConfig.getJwtIssuer())
                .subject(user.id.toString())
                .upn(user.email)
                .groups(Set.of(user.role))
                .expiresIn(Duration.ofSeconds(lifespan))
                .sign();
        return new AuthResponse(token, lifespan, user.id, user.username);
    }
}
