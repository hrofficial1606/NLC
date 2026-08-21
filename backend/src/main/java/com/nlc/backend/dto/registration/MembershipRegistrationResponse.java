package com.nlc.backend.dto.registration;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Membership registration summary. The private payment-proof object key is
 * NOT exposed here — admins retrieve it via the admin-only payment-proof
 * endpoint which returns a short-lived signed URL on demand.
 *
 * Returned both to the public submitter (their own record) and to admins
 * (any record).
 */
public record MembershipRegistrationResponse(
        Long userId,
        String fullName,
        String email,
        String phoneNumber,
        String city,
        String profession,
        String registrationStatus,
        boolean hasPaymentProof,
        BigDecimal paymentAmount,
        String rejectionReason,
        String adminNote,
        LocalDateTime submittedAt,
        LocalDateTime reviewedAt,
        LocalDateTime createdAt
) {
}
