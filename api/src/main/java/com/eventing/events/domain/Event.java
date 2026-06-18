package com.eventing.events.domain;

import com.eventing.users.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import org.hibernate.annotations.JdbcType;
import org.hibernate.dialect.PostgreSQLEnumJdbcType;
import org.locationtech.jts.geom.Point;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "creator_id", nullable = false)
    public User creator;

    @Column(nullable = false, length = 200)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 50)
    public String category;

    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "event_visibility")
    public EventVisibility visibility;

    // @Enumerated(EnumType.STRING)
    @JdbcType(PostgreSQLEnumJdbcType.class)
    @Column(nullable = false, columnDefinition = "event_status")
    public EventStatus status;

    @Column(name = "cover_image_url")
    public String coverImageUrl;

    @Column(name = "location_name", length = 200)
    public String locationName;

    @Column(columnDefinition = "TEXT")
    public String address;

    @Column(columnDefinition = "geography(Point,4326)")
    public Point location;

    @Column(name = "starts_at", nullable = false)
    public LocalDateTime startsAt;

    @Column(name = "ends_at")
    public LocalDateTime endsAt;

    @Column(name = "max_participants")
    public Integer maxParticipants;

    @Column(name = "participant_count", nullable = false)
    public int participantCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = EventStatus.DRAFT;
        if (visibility == null) visibility = EventVisibility.PUBLIC;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
