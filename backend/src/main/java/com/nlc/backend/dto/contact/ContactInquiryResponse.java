package com.nlc.backend.dto.contact;

import java.time.LocalDateTime;

public record ContactInquiryResponse(
        Long id,
        String name,
        String email,
        String phoneNumber,
        String subject,
        String message,
        String status,
        LocalDateTime createdAt
) {
}
