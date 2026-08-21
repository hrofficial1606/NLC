package com.nlc.backend.dto.registration;

import java.time.Instant;

/**
 * Admin-only payload for the membership payment-proof signed URL endpoint.
 * Mirrors {@code BookingPaymentProofResponse}. URL is short-lived (TTL from
 * {@code app.storage.supabase.signed-url-ttl-seconds}, default 300s).
 */
public record MembershipRegistrationPaymentProofResponse(
        Long userId,
        String email,
        String signedUrl,
        Instant expiresAt,
        int ttlSeconds
) {
}
