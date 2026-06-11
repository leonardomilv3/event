package com.eventing.social;

import com.eventing.social.domain.Follow;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class SocialRepository implements PanacheRepositoryBase<Follow, UUID> {

    public List<Follow> findFollowers(UUID userId) {
        return find("following.id", userId).list();
    }

    public List<Follow> findFollowing(UUID userId) {
        return find("follower.id", userId).list();
    }

    public Optional<Follow> findFollow(UUID followerId, UUID followingId) {
        return find("follower.id = ?1 and following.id = ?2", followerId, followingId)
                .firstResultOptional();
    }

    public boolean isFollowing(UUID followerId, UUID followingId) {
        return count("follower.id = ?1 and following.id = ?2", followerId, followingId) > 0;
    }
}
