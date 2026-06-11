package com.eventing.events;

import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventDto;
import com.eventing.shared.response.ApiResponse;
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
import java.util.List;
import java.util.UUID;

@Path("/api/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Events", description = "Gerenciamento de eventos")
public class EventController {

    @Inject
    EventService eventService;

    @Inject
    JsonWebToken jwt;

    @GET
    @Operation(summary = "Listar eventos publicados")
    public Response list(
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size) {
        List<EventDto> events = eventService.listPublished(page, size);
        return Response.ok(ApiResponse.ok(events)).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Buscar evento por ID")
    public Response findById(@PathParam("id") UUID id) {
        EventDto event = eventService.findById(id);
        return Response.ok(ApiResponse.ok(event)).build();
    }

    @POST
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Criar novo evento")
    public Response create(@Valid CreateEventRequest request) {
        UUID organizerId = UUID.fromString(jwt.getSubject());
        EventDto event = eventService.create(organizerId, request);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(event)).build();
    }
}
