package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.OneToOne;
import jakarta.persistence.Table;
import java.time.LocalDate;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "member_cards")
public class MemberCard extends AuditableEntity {

    @OneToOne(optional = false)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(nullable = false, unique = true, length = 40)
    private String cardNumber;

    @Column(nullable = false, length = 80)
    private String membershipPlan;

    @Column(length = 120)
    private String designation;

    @Column(nullable = false)
    private LocalDate validFrom;

    @Column(nullable = false)
    private LocalDate validUntil;

    @Column(length = 600)
    private String qrCodeUrl;

    @Column(columnDefinition = "TEXT")
    private String cardImageUrl;

    @Column(length = 120)
    private String accentColor;

    @Column(length = 500)
    private String notes;

    @Column(nullable = false)
    private boolean active = true;
}
