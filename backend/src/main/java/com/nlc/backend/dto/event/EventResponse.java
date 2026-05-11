package com.nlc.backend.dto.event;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventResponse(
        Long id,
        String title,
        String slug,
        String description,
        String shortDescription,
        LocalDateTime eventDate,
        String location,
        BigDecimal ticketPrice,
        Integer totalSeats,
        Integer availableSeats,
        boolean featured,
        boolean available,
        String bannerImageUrl,
        String status
) {
}
