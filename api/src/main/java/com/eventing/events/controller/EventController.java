package com.eventing.events.controller;

import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventResponse;
import com.eventing.events.dto.UpdateEventRequest;
import com.eventing.events.service.EventService;
import com.eventing.participants.dto.ParticipantResponse;
import com.eventing.participants.service.ParticipantService;
import com.eventing.shared.response.ApiResponse;
import com.eventing.shared.response.PageResponse;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.NotNull;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.eclipse.microprofile.openapi.annotations.Operation;
import org.eclipse.microprofile.openapi.annotations.security.SecurityRequirement;
import org.eclipse.microprofile.openapi.annotations.tags.Tag;

import java.util.UUID;

@Path("/api/events")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Tag(name = "Events", description = "Criação e gestão de eventos")
public class EventController {

    @Inject EventService eventService;
    @Inject ParticipantService participantService;
    @Inject JsonWebToken jwt;

    // ── Listagens ─────────────────────────────────────────────────────────────

    @GET
    @Operation(summary = "Listar eventos públicos — filtrável por categoria ou criador")
    public Response listEvents(
            @QueryParam("category") String category,
            @QueryParam("creatorId") UUID creatorId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        PageResponse<EventResponse> result;
        if (category != null) {
            result = eventService.getByCategory(category, page, size);
        } else if (creatorId != null) {
            result = eventService.getByCreatorId(creatorId, page, size);
        } else {
            result = eventService.getPublicEvents(page, size);
        }
        return Response.ok(ApiResponse.ok(result)).build();
    }

    // ── CRUD ──────────────────────────────────────────────────────────────────

    @POST
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Criar evento")
    public Response create(@Valid CreateEventRequest request) {
        UUID creatorId = UUID.fromString(jwt.getSubject());
        EventResponse event = eventService.create(creatorId, request);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(event)).build();
    }

    @GET
    @Path("/{id}")
    @Operation(summary = "Buscar evento por ID")
    public Response getById(@PathParam("id") UUID id) {
        EventResponse event = eventService.getById(id);
        return Response.ok(ApiResponse.ok(event)).build();
    }

    @PUT
    @Path("/{id}")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Atualizar evento (somente criador)")
    public Response update(@PathParam("id") UUID id, @Valid UpdateEventRequest request) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        EventResponse event = eventService.update(currentUserId, id, request);
        return Response.ok(ApiResponse.ok(event)).build();
    }

    @DELETE
    @Path("/{id}")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Cancelar evento — soft delete via status CANCELLED")
    public Response delete(@PathParam("id") UUID id) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        eventService.delete(currentUserId, id);
        return Response.noContent().build();
    }

    @POST
    @Path("/{id}/publish")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Operation(summary = "Publicar evento — DRAFT → PUBLISHED")
    public Response publish(@PathParam("id") UUID id) {
        UUID currentUserId = UUID.fromString(jwt.getSubject());
        EventResponse event = eventService.publish(currentUserId, id);
        return Response.ok(ApiResponse.ok(event)).build();
    }

    // ── Geolocalização ────────────────────────────────────────────────────────

    @GET
    @Path("/nearby")
    @Operation(summary = "Eventos próximos ordenados por distância")
    public Response findNearby(
            @QueryParam("lat") @NotNull Double lat,
            @QueryParam("lon") @NotNull Double lon,
            @QueryParam("radius") @DefaultValue("10") @DecimalMax("50") double radius,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        PageResponse<EventResponse> result = eventService.findNearby(lat, lon, radius, page, size);
        return Response.ok(ApiResponse.ok(result)).build();
    }

    @GET
    @Path("/feed")
    @Operation(summary = "Feed de eventos com score composto (distância + popularidade + urgência)")
    public Response findFeed(
            @QueryParam("lat") @NotNull Double lat,
            @QueryParam("lon") @NotNull Double lon,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        PageResponse<EventResponse> result = eventService.findFeed(lat, lon, page, size);
        return Response.ok(ApiResponse.ok(result)).build();
    }

    // ── Participants ──────────────────────────────────────────────────────────

    @POST
    @Path("/{eventId}/join")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Tag(name = "Participants")
    @Operation(summary = "Participar de um evento (PUBLIC → APPROVED, INVITE_ONLY → REQUESTED)")
    public Response join(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        ParticipantResponse response = participantService.join(userId, eventId);
        return Response.status(Response.Status.CREATED).entity(ApiResponse.ok(response)).build();
    }

    @DELETE
    @Path("/{eventId}/leave")
    @RolesAllowed("user")
    @SecurityRequirement(name = "jwt")
    @Tag(name = "Participants")
    @Operation(summary = "Sair de um evento (status → DECLINED, decrementa count se APPROVED)")
    public Response leave(@PathParam("eventId") UUID eventId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        participantService.leave(userId, eventId);
        return Response.noContent().build();
    }

    @GET
    @Path("/{eventId}/participants")
    @Tag(name = "Participants")
    @Operation(summary = "Listar participantes aprovados de um evento")
    public Response listParticipants(
            @PathParam("eventId") UUID eventId,
            @QueryParam("page") @DefaultValue("0") int page,
            @QueryParam("size") @DefaultValue("20") int size
    ) {
        PageResponse<ParticipantResponse> result = participantService.listParticipants(eventId, page, size);
        return Response.ok(ApiResponse.ok(result)).build();
    }
}