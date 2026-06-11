package com.eventing.users;

import com.eventing.shared.response.ApiResponse;
import com.eventing.users.dto.UserDto;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
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
@Tag(name = "Users", description = "Gerenciamento de usuários")
public class UserController {

    @Inject
    UserService userService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Path("/{id}")
    @Operation(summary = "Buscar usuário por ID")
    public Response findById(@PathParam("id") UUID id) {
        UserDto user = userService.findById(id);
        return Response.ok(ApiResponse.ok(user)).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Perfil do usuário autenticado")
    public Response me() {
        UUID id = UUID.fromString(jwt.getSubject());
        UserDto user = userService.findById(id);
        return Response.ok(ApiResponse.ok(user)).build();
    }
}
