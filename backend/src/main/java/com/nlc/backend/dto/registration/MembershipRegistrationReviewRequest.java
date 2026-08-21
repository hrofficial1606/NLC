package com.nlc.backend.dto.registration;

import jakarta.validation.constraints.Size;

public record MembershipRegistrationReviewRequest(
        @Size(max = 1000) String adminNote,
        @Size(max = 1000) String rejectionReason
) {
}
