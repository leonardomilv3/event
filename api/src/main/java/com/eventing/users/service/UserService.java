package com.eventing.users.service;

import com.eventing.shared.exception.ApiException;
import com.eventing.users.ProfileRepository;
import com.eventing.users.UserRepository;
import com.eventing.users.domain.Profile;
import com.eventing.users.domain.User;
import com.eventing.users.dto.UpdateProfileRequest;
import com.eventing.users.dto.UserDto;
import com.eventing.users.dto.UserProfileResponse;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class UserService {

    @Inject
    UserRepository userRepository;

    @Inject
    ProfileRepository profileRepository;

    @Inject
    UserMapper userMapper;

    public UserDto findById(UUID id) {
        User user = userRepository.findById(id);
        if (user == null) throw ApiException.notFound("Usuário");
        return userMapper.toDto(user);
    }

    public UserProfileResponse getProfile(UUID userId) {
        User user = userRepository.findById(userId);
        if (user == null) throw ApiException.notFound("Usuário");
        Profile profile = profileRepository.findById(userId);
        return toResponse(user, profile, true);
    }

    public UserProfileResponse getPublicProfile(UUID userId) {
        User user = userRepository.findById(userId);
        if (user == null) throw ApiException.notFound("Usuário");
        Profile profile = profileRepository.findById(userId);
        return toResponse(user, profile, false);
    }

    @Transactional
    public UserProfileResponse updateProfile(UUID currentUserId, UUID targetUserId, UpdateProfileRequest request) {
        if (!currentUserId.equals(targetUserId)) {
            throw ApiException.forbidden();
        }
        User user = userRepository.findById(currentUserId);
        if (user == null) throw ApiException.notFound("Usuário");

        Profile profile = profileRepository.findById(currentUserId);
        if (profile == null) {
            profile = new Profile();
            profile.userId = currentUserId;
        }
        if (request.displayName() != null) profile.displayName = request.displayName();
        if (request.bio() != null) profile.bio = request.bio();
        if (request.city() != null) profile.city = request.city();
        if (request.interests() != null) profile.interests = request.interests().toArray(String[]::new);

        profileRepository.persist(profile);
        return toResponse(user, profile, true);
    }

    private UserProfileResponse toResponse(User user, Profile profile, boolean includeEmail) {
        List<String> interests = (profile != null && profile.interests != null)
                ? Arrays.asList(profile.interests)
                : null;
        return new UserProfileResponse(
                user.id,
                includeEmail ? user.email : null,
                user.username,
                profile != null ? profile.displayName : null,
                profile != null ? profile.avatarUrl : null,
                profile != null ? profile.bio : null,
                profile != null ? profile.city : null,
                interests,
                user.createdAt
        );
    }
}
