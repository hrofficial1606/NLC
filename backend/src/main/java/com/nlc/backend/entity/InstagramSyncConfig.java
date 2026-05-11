package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "instagram_sync_config")
public class InstagramSyncConfig extends AuditableEntity {

    @Column(nullable = false)
    private boolean enabled = false;

    @Column(length = 255)
    private String accessToken;

    @Column(length = 120)
    private String userId;

    private LocalDateTime lastSyncedAt;
}
