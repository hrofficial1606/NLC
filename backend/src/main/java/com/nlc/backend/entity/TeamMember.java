package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "team_members")
public class TeamMember extends AuditableEntity {

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String designation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(length = 500)
    private String imageUrl;

    @Column(length = 255)
    private String instagramUrl;

    @Column(length = 255)
    private String facebookUrl;

    @Column(length = 255)
    private String linkedinUrl;

    @Column(nullable = false)
    private Integer displayOrder = 0;
}
