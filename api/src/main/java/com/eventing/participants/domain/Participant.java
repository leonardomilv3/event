package com.eventing.participants.domain;

import com.eventing.events.domain.Event;
import com.eventing.users.domain.User;
import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "participants",
       uniqueConstraints = @UniqueConstraint(columnNames = {"event_id", "user_id"}))
public class Participant extends PanacheEntityBase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    public UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    public Event event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    public ParticipantStatus status;

    @Column(name = "joined_at", nullable = false, updatable = false)
    public LocalDateTime joinedAt;

    @PrePersist
    void onCreate() {
        joinedAt = LocalDateTime.now();
        if (status == null) status = ParticipantStatus.CONFIRMED;
    }
}
