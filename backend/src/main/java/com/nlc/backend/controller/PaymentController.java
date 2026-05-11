package com.nlc.backend.controller;

import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.payment.CreatePaymentOrderRequest;
import com.nlc.backend.dto.payment.PaymentOrderResponse;
import com.nlc.backend.dto.payment.PaymentVerificationRequest;
import com.nlc.backend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/orders")
    public ApiResponse<PaymentOrderResponse> createOrder(@Valid @RequestBody CreatePaymentOrderRequest request) {
        return ApiResponse.success("Payment order created", paymentService.createOrder(request));
    }

    @PostMapping("/verify")
    public ApiResponse<Void> verifyPayment(@Valid @RequestBody PaymentVerificationRequest request) {
        paymentService.verifyPayment(request);
        return ApiResponse.success("Payment verified successfully", null);
    }

    @PostMapping("/webhook")
    public ApiResponse<Void> webhook(@RequestBody String payload,
                                     @RequestHeader(name = "X-Razorpay-Signature", required = false) String signature) {
        paymentService.handleWebhook(payload, signature);
        return ApiResponse.success("Webhook processed", null);
    }
}
