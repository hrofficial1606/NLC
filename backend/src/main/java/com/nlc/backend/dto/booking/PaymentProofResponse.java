package com.nlc.backend.dto.booking;

import java.time.Instant;

/**
 * Admin-only payload for the payment-proof signed URL endpoint.
 *
 * The signed URL is generated on demand from the private Supabase bucket and is
 * short-lived (TTL controlled by {@code app.storage.supabase.signed-url-ttl-seconds}).
 * Never persist or log the URL — it grants time-bounded access to a private object.
 */
public record PaymentProofResponse(
        Long bookingId,
        String bookingReference,
        String signedUrl,
        Instant expiresAt,
        int ttlSeconds
) {
}