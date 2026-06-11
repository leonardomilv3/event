package com.eventing.users.domain;

import io.quarkus.hibernate.orm.panache.PanacheEntityBase;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "profiles")
public class Profile extends PanacheEntityBase {

    @Id
    @Column(name = "user_id")
    public UUID userId;

    @Column(name = "display_name", length = 100)
    public String displayName;

    @Column(name = "avatar_url")
    public String avatarUrl;

    @Column(columnDefinition = "TEXT")
    public String bio;

    @Column(length = 100)
    public String city;

    @Column(name = "interests", columnDefinition = "TEXT[]")
    public String[] interests;

    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    void onPersist() {
        updatedAt = LocalDateTime.now();
    }
}
