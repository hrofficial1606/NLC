package com.nlc.backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record BookingResponse(
        Long id,
        String bookingReference,
        Long eventId,
        String eventTitle,
        Integer quantity,
        BigDecimal totalAmount,
        String status,
        boolean paidEvent,
        String paymentScreenshotUrl,
        String rejectionReason,
        String adminNote,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt
) {
}
