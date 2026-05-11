package com.nlc.backend.service;

import com.nlc.backend.dto.payment.CreatePaymentOrderRequest;
import com.nlc.backend.dto.payment.PaymentOrderResponse;
import com.nlc.backend.dto.payment.PaymentVerificationRequest;

public interface PaymentService {
    PaymentOrderResponse createOrder(CreatePaymentOrderRequest request);
    void verifyPayment(PaymentVerificationRequest request);
    void handleWebhook(String payload, String signature);
}
