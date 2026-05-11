package com.nlc.backend.service;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import java.util.List;

public interface BookingService {
    BookingResponse createBooking(Long userId, BookingRequest request);
    List<BookingResponse> getUserBookings(Long userId);
    List<BookingResponse> getAllBookings();
}
