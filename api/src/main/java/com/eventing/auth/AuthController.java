package com.eventing.auth;

import com.eventing.auth.dto.AuthResponse;
import com.eventing.auth.dto.LoginRequest;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.shared.response.ApiResponse;
import com.eventing.users.UserService;
import com.eventing.users.dto.UserDto;
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

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth", description = "Registro e login de usuários")
public class AuthController {

    @Inject
    AuthService authService;

    @Inject
    UserService userService;

    @Inject
    JsonWebToken jwt;

    @POST
    @Path("/register")
    @Operation(summary = "Registrar novo usuário")
    public Response register(@Valid RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(response)).build();
    }

    @POST
    @Path("/login")
    @Operation(summary = "Autenticar usuário")
    public Response login(@Valid LoginRequest request) {
        AuthResponse response = authService.login(request);
        return Response.ok(ApiResponse.ok(response)).build();
    }

    @GET
    @Path("/me")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Dados do usuário autenticado")
    public Response me() {
        UUID id = UUID.fromString(jwt.getSubject());
        UserDto user = userService.findById(id);
        return Response.ok(ApiResponse.ok(user)).build();
    }
}
