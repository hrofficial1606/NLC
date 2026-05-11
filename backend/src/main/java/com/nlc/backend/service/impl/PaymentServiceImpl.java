package com.nlc.backend.service.impl;

import com.nlc.backend.config.AppProperties;
import com.nlc.backend.dto.payment.CreatePaymentOrderRequest;
import com.nlc.backend.dto.payment.PaymentOrderResponse;
import com.nlc.backend.dto.payment.PaymentVerificationRequest;
import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.PaymentTransaction;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.entity.enums.PaymentStatus;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.BookingRepository;
import com.nlc.backend.repository.PaymentTransactionRepository;
import com.nlc.backend.service.PaymentService;
import com.razorpay.Order;
import com.razorpay.RazorpayClient;
import java.math.BigDecimal;
import lombok.RequiredArgsConstructor;
import org.json.JSONObject;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final RazorpayClient razorpayClient;
    private final AppProperties appProperties;
    private final BookingRepository bookingRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    @Override
    @Transactional
    public PaymentOrderResponse createOrder(CreatePaymentOrderRequest request) {
        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));
        try {
            JSONObject options = new JSONObject();
            options.put("amount", booking.getTotalAmount().multiply(BigDecimal.valueOf(100)).intValue());
            options.put("currency", appProperties.getPayment().getRazorpay().getCurrency());
            options.put("receipt", booking.getBookingReference());
            Order order = razorpayClient.orders.create(options);

            PaymentTransaction transaction = new PaymentTransaction();
            transaction.setOrderId(order.get("id"));
            transaction.setAmount(booking.getTotalAmount());
            transaction.setCurrency(appProperties.getPayment().getRazorpay().getCurrency());
            transaction.setBooking(booking);
            transaction.setStatus(PaymentStatus.CREATED);
            paymentTransactionRepository.save(transaction);

            return new PaymentOrderResponse(
                    transaction.getOrderId(),
                    appProperties.getPayment().getRazorpay().getKeyId(),
                    transaction.getAmount(),
                    transaction.getCurrency(),
                    transaction.getStatus().name()
            );
        } catch (Exception ex) {
            throw new BadRequestException("Unable to create Razorpay order");
        }
    }

    @Override
    @Transactional
    public void verifyPayment(PaymentVerificationRequest request) {
        PaymentTransaction transaction = paymentTransactionRepository.findByOrderId(request.orderId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment order not found"));
        transaction.setPaymentId(request.paymentId());
        transaction.setSignature(request.signature());
        transaction.setStatus(PaymentStatus.PAID);
        paymentTransactionRepository.save(transaction);

        Booking booking = transaction.getBooking();
        booking.setStatus(BookingStatus.CONFIRMED);
        bookingRepository.save(booking);
    }

    @Override
    public void handleWebhook(String payload, String signature) {
        // Hook for validating webhook signature and reconciling payment states.
    }
}
