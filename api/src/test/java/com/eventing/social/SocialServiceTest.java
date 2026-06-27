package com.eventing.social;

import com.eventing.TestFixtures;
import com.eventing.auth.AuthService;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.shared.exception.ApiException;
import com.eventing.social.dto.FollowDto;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class SocialServiceTest {

    @Inject AuthService authService;
    @Inject SocialService socialService;

    // ── FOLLOW ────────────────────────────────────────────────────────────────

    @Test
    void shouldFollowUserSuccessfully() {
        AuthResponse a = registerUser();
        AuthResponse b = registerUser();

        FollowDto result = socialService.follow(a.userId(), b.userId());

        assertNotNull(result.id());
        assertNotNull(result.follower());
        assertNotNull(result.following());
        assertEquals(a.userId(), result.follower().id());
        assertEquals(b.userId(), result.following().id());
    }

    @Test
    void shouldFailFollowSelf() {
        AuthResponse a = registerUser();

        ApiException ex = assertThrows(ApiException.class,
            () -> socialService.follow(a.userId(), a.userId()));

        assertEquals(Response.Status.BAD_REQUEST, ex.getStatus());
    }

    @Test
    void shouldFailFollowSameUserTwice() {
        AuthResponse a = registerUser();
        AuthResponse b = registerUser();

        socialService.follow(a.userId(), b.userId());

        ApiException ex = assertThrows(ApiException.class,
            () -> socialService.follow(a.userId(), b.userId()));

        assertEquals(Response.Status.CONFLICT, ex.getStatus());
    }

    @Test
    void shouldFailFollowNonexistentUser() {
        AuthResponse a = registerUser();

        ApiException ex = assertThrows(ApiException.class,
            () -> socialService.follow(a.userId(), UUID.randomUUID()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── UNFOLLOW ──────────────────────────────────────────────────────────────

    @Test
    void shouldUnfollowSuccessfully() {
        AuthResponse a = registerUser();
        AuthResponse b = registerUser();

        socialService.follow(a.userId(), b.userId());
        socialService.unfollow(a.userId(), b.userId());

        // Após unfollow, getFollowing deve não conter B
        List<FollowDto> following = socialService.getFollowing(a.userId());
        boolean stillFollowing = following.stream()
            .anyMatch(f -> f.following().id().equals(b.userId()));
        assertFalse(stillFollowing);
    }

    @Test
    void shouldFailUnfollowWhenNotFollowing() {
        AuthResponse a = registerUser();
        AuthResponse b = registerUser();

        ApiException ex = assertThrows(ApiException.class,
            () -> socialService.unfollow(a.userId(), b.userId()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── FOLLOWERS / FOLLOWING ─────────────────────────────────────────────────

    @Test
    void getFollowersShouldReturnTwoWhenTwoUsersFollow() {
        AuthResponse b = registerUser();
        AuthResponse a = registerUser();
        AuthResponse c = registerUser();

        socialService.follow(a.userId(), b.userId());
        socialService.follow(c.userId(), b.userId());

        List<FollowDto> followers = socialService.getFollowers(b.userId());

        assertEquals(2, followers.size());
        assertTrue(followers.stream().anyMatch(f -> f.follower().id().equals(a.userId())));
        assertTrue(followers.stream().anyMatch(f -> f.follower().id().equals(c.userId())));
    }

    @Test
    void getFollowingShouldReturnOneWhenFollowingOneUser() {
        AuthResponse a = registerUser();
        AuthResponse b = registerUser();

        socialService.follow(a.userId(), b.userId());

        List<FollowDto> following = socialService.getFollowing(a.userId());

        assertEquals(1, following.size());
        assertEquals(b.userId(), following.getFirst().following().id());
    }

    @Test
    void getFollowersShouldReturnEmptyForNewUser() {
        AuthResponse newUser = registerUser();

        List<FollowDto> followers = socialService.getFollowers(newUser.userId());

        assertTrue(followers.isEmpty());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuthResponse registerUser() {
        return authService.register(TestFixtures.registerRequest(TestFixtures.uniqueSuffix()));
    }
}
