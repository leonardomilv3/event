package com.eventing.participants;

import com.eventing.participants.dto.ParticipantDto;
import com.eventing.shared.response.ApiResponse;
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

@Path("/api/events/{eventId}/participants")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Participants", description = "Participantes de eventos")
public class ParticipantController {

    @Inject
    ParticipantService participantService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Operation(summary = "Listar participantes de um evento")
    public Response list(@PathParam("eventId") UUID eventId) {
        List<ParticipantDto> participants = participantService.listByEvent(eventId);
        return Response.ok(ApiResponse.ok(participants)).build();
    }

    @POST
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Participar de um evento")
    public Response join(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        ParticipantDto participant = participantService.join(eventId, userId);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(participant)).build();
    }

    @DELETE
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Cancelar participação em um evento")
    public Response leave(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        participantService.leave(eventId, userId);
        return Response.noContent().build();
    }
}
