package com.nlc.backend.dto.membership;

import java.math.BigDecimal;

/**
 * Public membership payment configuration (fee, QR, UPI). Exposed without auth
 * so the registration page can render the payment step. The fee is returned as
 * a {@link BigDecimal} derived from the configured string value.
 */
public record MembershipPaymentConfigResponse(
        String fee,
        BigDecimal feeAmount,
        String upiId,
        String qrImageUrl,
        String paymentInstructions,
        boolean enabled
) {
}
