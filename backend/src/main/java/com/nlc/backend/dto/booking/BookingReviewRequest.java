package com.nlc.backend.dto.booking;

import jakarta.validation.constraints.Size;

public record BookingReviewRequest(
        @Size(max = 1000) String adminNote,
        @Size(max = 1000) String rejectionReason
) {
}
