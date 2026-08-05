package com.nlc.backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * User-facing booking summary. The private payment-proof object key is intentionally
 * NOT exposed here — admins retrieve it via {@code GET /admin/bookings/{id}/payment-proof}
 * which returns a short-lived signed URL on demand.
 */
public record BookingResponse(
        Long id,
        String bookingReference,
        Long eventId,
        String eventTitle,
        Integer quantity,
        BigDecimal totalAmount,
        String status,
        boolean paidEvent,
        boolean hasPaymentProof,
        String rejectionReason,
        String adminNote,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt
) {
}