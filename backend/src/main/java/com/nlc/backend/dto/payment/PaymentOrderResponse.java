package com.nlc.backend.dto.payment;

import java.math.BigDecimal;

public record PaymentOrderResponse(
        String orderId,
        String keyId,
        BigDecimal amount,
        String currency,
        String status
) {
}
