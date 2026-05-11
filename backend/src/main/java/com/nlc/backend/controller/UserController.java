package com.nlc.backend.controller;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.security.UserPrincipal;
import com.nlc.backend.service.BookingService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final BookingService bookingService;

    @PostMapping("/bookings")
    public ApiResponse<BookingResponse> bookEvent(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestBody BookingRequest request) {
        return ApiResponse.success("Booking created", bookingService.createBooking(principal.getId(), request));
    }

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> myBookings(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Bookings fetched", bookingService.getUserBookings(principal.getId()));
    }
}
