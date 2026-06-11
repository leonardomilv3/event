package com.eventing.auth;

import com.eventing.auth.dto.LoginRequest;
import com.eventing.auth.dto.LoginResponse;
import com.eventing.auth.dto.RegisterRequest;
import com.eventing.shared.response.ApiResponse;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

@Path("/api/auth")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Auth", description = "Registro e login de usuários")
public class AuthController {

    @Inject
    AuthService authService;

    @POST
    @Path("/register")
    @Operation(summary = "Registrar novo usuário")
    public Response register(@Valid RegisterRequest request) {
        LoginResponse response = authService.register(request);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(response)).build();
    }

    @POST
    @Path("/login")
    @Operation(summary = "Autenticar usuário")
    public Response login(@Valid LoginRequest request) {
        LoginResponse response = authService.login(request);
        return Response.ok(ApiResponse.ok(response)).build();
    }
}
