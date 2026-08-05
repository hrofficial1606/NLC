package com.nlc.backend.service;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingReviewRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.dto.booking.PaymentProofResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface BookingService {
    BookingResponse createBooking(Long userId, BookingRequest request, MultipartFile paymentScreenshot);
    BookingResponse approveBooking(Long bookingId, Long adminUserId, BookingReviewRequest request);
    BookingResponse rejectBooking(Long bookingId, Long adminUserId, BookingReviewRequest request);
    List<BookingResponse> getUserBookings(Long userId);
    List<BookingResponse> getAllBookings(String status);

    /**
     * Generates a short-lived signed URL for the private payment-proof object so
     * the admin can view the screenshot. Must only be invoked by ROLE_ADMIN paths.
     */
    PaymentProofResponse generateAdminPaymentProof(Long bookingId);
}
