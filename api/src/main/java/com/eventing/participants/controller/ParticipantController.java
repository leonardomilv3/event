package com.eventing.participants.controller;

import com.eventing.events.dto.EventResponse;
import com.eventing.participants.dto.ParticipantResponse;
import com.eventing.participants.service.ParticipantService;
import com.eventing.shared.response.ApiResponse;
import com.eventing.shared.response.PageResponse;
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

@Path("/api")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Participants", description = "Participação em eventos")
public class ParticipantController {

    @Inject ParticipantService participantService;
    @Inject JsonWebToken jwt;

    @POST
    @Path("/events/{eventId}/join")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Participar de um evento (PUBLIC → APPROVED, INVITE_ONLY → REQUESTED)")
    public Response join(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        ParticipantResponse response = participantService.join(userId, eventId);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(response)).build();
    }

    @DELETE
    @Path("/events/{eventId}/leave")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Sair de um evento (status → DECLINED, decrementa count se APPROVED)")
    public Response leave(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        participantService.leave(userId, eventId);
        return Response.noContent().build();
    }

    @GET
    @Path("/events/{eventId}/participants")
    @Operation(summary = "Listar participantes aprovados de um evento")
    public Response listParticipants(
            @PathParam("eventId") UUID eventId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        PageResponse<ParticipantResponse> result = participantService.listParticipants(eventId, page, size);
        return Response.ok(ApiResponse.ok(result)).build();
    }

    @GET
    @Path("/users/me/events")
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
}
