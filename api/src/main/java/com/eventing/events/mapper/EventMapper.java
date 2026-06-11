package com.eventing.events.mapper;

import com.eventing.events.domain.Event;
import com.eventing.events.dto.EventDto;
import com.eventing.users.mapper.UserMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;

@ApplicationScoped
public class EventMapper {

    @Inject
    UserMapper userMapper;

    public EventDto toDto(Event event) {
        if (event == null) return null;
        return new EventDto(
                event.id,
                event.title,
                event.description,
                event.category,
                event.startAt,
                event.endAt,
                event.location,
                event.price,
                event.maxParticipants,
                event.imageUrl,
                event.status,
                userMapper.toDto(event.organizer),
                event.createdAt
        );
    }
}
