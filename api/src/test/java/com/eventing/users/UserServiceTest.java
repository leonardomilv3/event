package com.eventing.users;

import com.eventing.TestFixtures;
import com.eventing.auth.AuthService;
import com.eventing.auth.dto.AuthResponse;
import com.eventing.shared.exception.ApiException;
import com.eventing.users.dto.UpdateProfileRequest;
import com.eventing.users.dto.UserDto;
import com.eventing.users.dto.UserProfileResponse;
import com.eventing.users.dto.UserPublicProfileResponse;
import com.eventing.users.service.UserService;
import io.quarkus.test.junit.QuarkusTest;
import jakarta.inject.Inject;
import jakarta.ws.rs.core.Response;
import org.junit.jupiter.api.Test;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@QuarkusTest
class UserServiceTest {

    @Inject AuthService authService;
    @Inject UserService userService;

    // ── findById ──────────────────────────────────────────────────────────────

    @Test
    void findByIdShouldReturnUserDto() {
        AuthResponse auth = registerUser();

        UserDto dto = userService.findById(auth.userId());

        assertNotNull(dto);
        assertEquals(auth.userId(), dto.id());
        assertEquals(auth.username(), dto.username());
    }

    @Test
    void findByIdShouldThrow404ForNonexistentUser() {
        ApiException ex = assertThrows(ApiException.class,
            () -> userService.findById(UUID.randomUUID()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── getProfile ────────────────────────────────────────────────────────────

    @Test
    void getProfileShouldReturnFullProfile() {
        AuthResponse auth = registerUser();

        UserProfileResponse profile = userService.getProfile(auth.userId());

        assertNotNull(profile);
        assertEquals(auth.userId(), profile.id());
        assertNotNull(profile.email());
        assertNotNull(profile.username());
    }

    @Test
    void getProfileShouldThrow404ForNonexistentUser() {
        ApiException ex = assertThrows(ApiException.class,
            () -> userService.getProfile(UUID.randomUUID()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── getPublicProfile ──────────────────────────────────────────────────────

    @Test
    void getPublicProfileShouldReturnPublicData() {
        AuthResponse auth = registerUser();

        UserPublicProfileResponse pub = userService.getPublicProfile(auth.userId());

        assertNotNull(pub);
        assertEquals(auth.userId(), pub.id());
        assertNotNull(pub.username());
        // public profile must not expose email — field does not exist on UserPublicProfileResponse
    }

    @Test
    void getPublicProfileShouldThrow404ForNonexistentUser() {
        ApiException ex = assertThrows(ApiException.class,
            () -> userService.getPublicProfile(UUID.randomUUID()));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── updateProfile ─────────────────────────────────────────────────────────

    @Test
    void updateProfileShouldPersistDisplayName() {
        AuthResponse auth = registerUser();

        var req = new UpdateProfileRequest("Nome Legal", null, null, null);
        UserProfileResponse updated = userService.updateProfile(auth.userId(), auth.userId(), req);

        assertEquals("Nome Legal", updated.displayName());
    }

    @Test
    void updateProfileShouldPersistBioAndCity() {
        AuthResponse auth = registerUser();

        var req = new UpdateProfileRequest(null, "Apaixonado por eventos", "Brasília", null);
        UserProfileResponse updated = userService.updateProfile(auth.userId(), auth.userId(), req);

        assertEquals("Apaixonado por eventos", updated.bio());
        assertEquals("Brasília", updated.city());
    }

    @Test
    void updateProfileShouldPersistInterests() {
        AuthResponse auth = registerUser();

        var req = new UpdateProfileRequest(null, null, null, List.of("MUSIC", "TECH"));
        UserProfileResponse updated = userService.updateProfile(auth.userId(), auth.userId(), req);

        assertNotNull(updated.interests());
        assertTrue(updated.interests().containsAll(List.of("MUSIC", "TECH")));
    }

    @Test
    void updateProfileShouldThrow403WhenCurrentDiffersFromTarget() {
        AuthResponse owner = registerUser();
        AuthResponse other = registerUser();

        var req = new UpdateProfileRequest("Hacker", null, null, null);

        ApiException ex = assertThrows(ApiException.class,
            () -> userService.updateProfile(other.userId(), owner.userId(), req));

        assertEquals(Response.Status.FORBIDDEN, ex.getStatus());
    }

    @Test
    void updateProfileShouldThrow404ForNonexistentUser() {
        UUID ghost = UUID.randomUUID();

        var req = new UpdateProfileRequest("Ghost", null, null, null);

        ApiException ex = assertThrows(ApiException.class,
            () -> userService.updateProfile(ghost, ghost, req));

        assertEquals(Response.Status.NOT_FOUND, ex.getStatus());
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private AuthResponse registerUser() {
        return authService.register(TestFixtures.registerRequest(TestFixtures.uniqueSuffix()));
    }
}
