package com.eventing.social;

import com.eventing.shared.exception.ApiException;
import com.eventing.social.domain.Follow;
import com.eventing.social.dto.FollowDto;
import com.eventing.users.UserRepository;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class SocialService {

    @Inject
    SocialRepository socialRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    UserMapper userMapper;

    public List<FollowDto> getFollowers(UUID userId) {
        return socialRepository.findFollowers(userId).stream()
                .map(f -> new FollowDto(f.id, userMapper.toDto(f.follower), userMapper.toDto(f.following), f.createdAt))
                .toList();
    }

    public List<FollowDto> getFollowing(UUID userId) {
        return socialRepository.findFollowing(userId).stream()
                .map(f -> new FollowDto(f.id, userMapper.toDto(f.follower), userMapper.toDto(f.following), f.createdAt))
                .toList();
    }

    @Transactional
    public FollowDto follow(UUID followerId, UUID followingId) {
        if (followerId.equals(followingId)) throw ApiException.badRequest("Não é possível seguir a si mesmo");
        if (socialRepository.isFollowing(followerId, followingId)) throw ApiException.conflict("Já segue este usuário");

        var follower = userRepository.findById(followerId);
        var following = userRepository.findById(followingId);
        if (follower == null || following == null) throw ApiException.notFound("Usuário");

        Follow follow = new Follow();
        follow.follower = follower;
        follow.following = following;
        socialRepository.persist(follow);
        return new FollowDto(follow.id, userMapper.toDto(follower), userMapper.toDto(following), follow.createdAt);
    }

    @Transactional
    public void unfollow(UUID followerId, UUID followingId) {
        socialRepository.findFollow(followerId, followingId)
                .ifPresentOrElse(
                        socialRepository::delete,
                        () -> { throw ApiException.notFound("Follow"); }
                );
    }
}
