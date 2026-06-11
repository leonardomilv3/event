package com.eventing.events.domain;

import com.eventing.users.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "events")
public class Event extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @Column(nullable = false, length = 200)
    public String title;

    @Column(columnDefinition = "TEXT")
    public String description;

    @Column(nullable = false, length = 100)
    public String category;

    @Column(nullable = false)
    public LocalDateTime startAt;

    @Column(nullable = false)
    public LocalDateTime endAt;

    @Column(length = 300)
    public String location;

    @Column(precision = 10, scale = 2)
    public BigDecimal price;

    @Column(name = "max_participants")
    public Integer maxParticipants;

    @Column(name = "image_url")
    public String imageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public EventStatus status;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "organizer_id", nullable = false)
    public User organizer;

    @Column(name = "created_at", nullable = false, updatable = false)
    public LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = updatedAt = LocalDateTime.now();
        if (status == null) status = EventStatus.DRAFT;
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
