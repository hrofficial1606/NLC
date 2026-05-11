package com.nlc.backend.repository;

import com.nlc.backend.entity.Role;
import com.nlc.backend.entity.enums.RoleType;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface RoleRepository extends JpaRepository<Role, Long> {
    Optional<Role> findByName(RoleType name);
}
