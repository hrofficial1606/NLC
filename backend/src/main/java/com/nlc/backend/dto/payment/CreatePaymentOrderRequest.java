package com.nlc.backend.dto.payment;

import jakarta.validation.constraints.NotNull;

public record CreatePaymentOrderRequest(@NotNull Long bookingId) {
}
