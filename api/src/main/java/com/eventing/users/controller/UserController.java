package com.eventing.users.controller;

import com.eventing.events.dto.EventResponse;
import com.eventing.participants.service.ParticipantService;
import com.eventing.shared.response.ApiResponse;
import com.eventing.shared.response.PageResponse;
import com.eventing.users.dto.UpdateProfileRequest;
import com.eventing.users.dto.UserProfileResponse;
import com.eventing.users.service.UserService;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/users")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Users", description = "Perfis de usuários")
public class UserController {

    @Inject UserService userService;
    @Inject ParticipantService participantService;
    @Inject JsonWebToken jwt;

    @GET
    @Path("/me")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Perfil completo do usuário autenticado")
    public Response me() {
        UUID id = UUID.fromString(jwt.getSubject());
        UserProfileResponse profile = userService.getProfile(id);
        return Response.ok(ApiResponse.ok(profile)).build();
    }

    @PUT
    @Path("/me")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Atualizar perfil do usuário autenticado")
    public Response updateMe(@Valid UpdateProfileRequest request) {
        UUID id = UUID.fromString(jwt.getSubject());
        UserProfileResponse profile = userService.updateProfile(id, id, request);
        return Response.ok(ApiResponse.ok(profile)).build();
    }

    @GET
    @Path("/me/events")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Eventos em que o usuário autenticado está inscrito como APPROVED")
    public Response getMyEvents(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        UUID userId = UUID.fromString(jwt.getSubject());
        PageResponse<EventResponse> result = participantService.getMyEvents(userId, page, size);
        return Response.ok(ApiResponse.ok(result)).build();
    }

    @GET
    @Path("/{userId}")
    @Operation(summary = "Perfil público de um usuário")
    public Response getPublicProfile(@PathParam("userId") UUID userId) {
        UserProfileResponse profile = userService.getPublicProfile(userId);
        return Response.ok(ApiResponse.ok(profile)).build();
    }
}