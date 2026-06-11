package com.eventing.users;

import com.eventing.users.domain.Profile;
import io.quarkus.hibernate.orm.panache.PanacheRepositoryBase;
import jakarta.enterprise.context.ApplicationScoped;
import java.util.UUID;

@ApplicationScoped
public class ProfileRepository implements PanacheRepositoryBase<Profile, UUID> {}
