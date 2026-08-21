package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import com.nlc.backend.entity.enums.AuthProvider;
import com.nlc.backend.entity.enums.RegistrationStatus;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.JoinTable;
import jakarta.persistence.ManyToMany;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "users")
public class User extends AuditableEntity {

    @Column(nullable = false, length = 120)
    private String fullName;

    @Column(nullable = false, unique = true, length = 120)
    private String email;

    @Column(nullable = false, unique = true, length = 20)
    private String phoneNumber;

    @Column(nullable = false)
    private String password;

    @Column(length = 120)
    private String city;

    @Column(length = 160)
    private String profession;

    @Column(length = 255)
    private String instagramProfile;

    @Column(length = 500)
    private String bio;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false)
    private boolean blocked = false;

    @Column(nullable = false)
    private boolean emailVerified = false;

    private LocalDateTime lastLoginAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private AuthProvider provider = AuthProvider.LOCAL;

    @ManyToMany(fetch = FetchType.EAGER)
    @JoinTable(
            name = "user_roles",
            joinColumns = @JoinColumn(name = "user_id"),
            inverseJoinColumns = @JoinColumn(name = "role_id")
    )
    private Set<Role> roles = new HashSet<>();

    @OneToMany(mappedBy = "user")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private List<Booking> bookings;

    // ===== Membership registration (payment-verified signup) =====
    // Existing users default to APPROVED via the column default below; new
    // memberships created via /auth/register-membership start as PENDING and
    // remain PENDING until an admin approves or rejects. This field is the
    // single source of truth — there is no parallel "active" flag.

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32, columnDefinition = "varchar(32) default 'APPROVED'")
    private RegistrationStatus registrationStatus = RegistrationStatus.APPROVED;

    /**
     * Private Supabase storage object key for the membership payment screenshot.
     * Never a public URL — only exposed via short-lived signed URLs to admins.
     */
    @Column(length = 600)
    private String registrationPaymentObjectKey;

    @Column(precision = 12, scale = 2)
    private java.math.BigDecimal registrationPaymentAmount;

    private LocalDateTime registrationSubmittedAt;

    private LocalDateTime registrationReviewedAt;

    @ManyToOne
    @JoinColumn(name = "registration_reviewed_by")
    @com.fasterxml.jackson.annotation.JsonIgnore
    private User registrationReviewedBy;

    @Column(length = 1000)
    private String registrationRejectionReason;

    @Column(length = 1000)
    private String registrationAdminNote;
}
