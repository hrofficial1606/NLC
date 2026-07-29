package com.nlc.backend.service;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingReviewRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface BookingService {
    BookingResponse createBooking(Long userId, BookingRequest request, MultipartFile paymentScreenshot);
    BookingResponse approveBooking(Long bookingId, Long adminUserId, BookingReviewRequest request);
    BookingResponse rejectBooking(Long bookingId, Long adminUserId, BookingReviewRequest request);
    List<BookingResponse> getUserBookings(Long userId);
    List<BookingResponse> getAllBookings(String status);
}
