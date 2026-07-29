package com.nlc.backend.dto.membercard;

import java.time.LocalDate;
import java.time.LocalDateTime;

public record MemberCardResponse(
        Long id,
        Long userId,
        String userName,
        String userEmail,
        String cardNumber,
        String membershipPlan,
        String designation,
        LocalDate validFrom,
        LocalDate validUntil,
        String qrCodeUrl,
        String cardImageUrl,
        String accentColor,
        String notes,
        boolean active,
        LocalDateTime createdAt
) {
}
