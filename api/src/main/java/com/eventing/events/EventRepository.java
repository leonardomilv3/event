package com.eventing.events;

import com.eventing.events.domain.Event;
import com.eventing.events.domain.EventStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import io.quarkus.panache.common.Page;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.List;
import java.util.UUID;

@ApplicationScoped
public class EventRepository implements PanacheRepositoryBase<Event, UUID> {

    public List<Event> findByCategory(String category, Page page) {
        return find("category = ?1 and status = ?2", category, EventStatus.PUBLISHED)
                .page(page)
                .list();
    }

    public List<Event> findPublished(Page page) {
        return find("status", EventStatus.PUBLISHED)
                .page(page)
                .list();
    }

    public List<Event> findByOrganizerId(UUID organizerId, Page page) {
        return find("organizer.id", organizerId)
                .page(page)
                .list();
    }
}
