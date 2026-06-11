package com.eventing.events;

import com.eventing.events.domain.Event;
import com.eventing.events.dto.CreateEventRequest;
import com.eventing.events.dto.EventDto;
import com.eventing.events.mapper.EventMapper;
import com.eventing.shared.exception.ApiException;
import com.eventing.shared.util.PaginationUtil;
import com.eventing.users.UserRepository;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EventService {

    @Inject
    EventRepository eventRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    EventMapper eventMapper;

    public List<EventDto> listPublished(int page, int size) {
        return eventRepository
                .findPublished(Page.of(PaginationUtil.normalizePage(page), PaginationUtil.normalizeSize(size)))
                .stream()
                .map(eventMapper::toDto)
                .toList();
    }

    public EventDto findById(UUID id) {
        Event event = eventRepository.findById(id);
        if (event == null) throw ApiException.notFound("Evento");
        return eventMapper.toDto(event);
    }

    @Transactional
    public EventDto create(UUID organizerId, CreateEventRequest request) {
        var organizer = userRepository.findById(organizerId);
        if (organizer == null) throw ApiException.notFound("Organizador");

        Event event = new Event();
        event.title = request.title();
        event.description = request.description();
        event.category = request.category();
        event.startAt = request.startAt();
        event.endAt = request.endAt();
        event.location = request.location();
        event.price = request.price();
        event.maxParticipants = request.maxParticipants();
        event.imageUrl = request.imageUrl();
        event.organizer = organizer;
        eventRepository.persist(event);
        return eventMapper.toDto(event);
    }
}
