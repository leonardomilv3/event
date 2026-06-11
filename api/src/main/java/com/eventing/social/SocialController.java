package com.eventing.social;

import com.eventing.shared.response.ApiResponse;
import com.eventing.social.dto.FollowDto;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;
import java.util.List;
import java.util.UUID;

@Path("/api/social")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Social", description = "Seguir e ser seguido")
public class SocialController {

    @Inject
    SocialService socialService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/users/{userId}/followers")
    @Operation(summary = "Listar seguidores de um usuário")
    public Response getFollowers(@PathParam("userId") UUID userId) {
        List<FollowDto> followers = socialService.getFollowers(userId);
        return Response.ok(ApiResponse.ok(followers)).build();
    }

    @GET
    @Path("/users/{userId}/following")
    @Operation(summary = "Listar quem o usuário segue")
    public Response getFollowing(@PathParam("userId") UUID userId) {
        List<FollowDto> following = socialService.getFollowing(userId);
        return Response.ok(ApiResponse.ok(following)).build();
    }

    @POST
    @Path("/users/{userId}/follow")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Seguir um usuário")
    public Response follow(@PathParam("userId") UUID userId) {
        UUID followerId = UUID.fromString(jwt.getSubject());
        FollowDto follow = socialService.follow(followerId, userId);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(follow)).build();
    }

    @DELETE
    @Path("/users/{userId}/follow")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Deixar de seguir um usuário")
    public Response unfollow(@PathParam("userId") UUID userId) {
        UUID followerId = UUID.fromString(jwt.getSubject());
        socialService.unfollow(followerId, userId);
        return Response.noContent().build();
    }
}
