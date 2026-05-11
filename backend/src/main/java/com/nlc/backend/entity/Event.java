package com.nlc.backend.entity;

import com.nlc.backend.entity.base.AuditableEntity;
import com.nlc.backend.entity.enums.EventStatus;
import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
@Entity
@Table(name = "events")
public class Event extends AuditableEntity {

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 300)
    private String slug;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(length = 180)
    private String shortDescription;

    @Column(nullable = false)
    private LocalDateTime eventDate;

    @Column(nullable = false, length = 180)
    private String location;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal ticketPrice = BigDecimal.ZERO;

    @Column(nullable = false)
    private Integer totalSeats = 0;

    @Column(nullable = false)
    private Integer availableSeats = 0;

    @Column(nullable = false)
    private boolean featured = false;

    @Column(nullable = false)
    private boolean available = true;

    @Column(length = 255)
    private String bannerImageUrl;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 32)
    private EventStatus status = EventStatus.DRAFT;

    @OneToMany(mappedBy = "event", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Booking> bookings = new ArrayList<>();
}
