package com.nlc.backend.controller;

import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingReviewRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.membercard.MemberCardResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationResponse;
import com.nlc.backend.security.UserPrincipal;
import com.nlc.backend.service.BookingService;
import com.nlc.backend.service.MemberCardService;
import com.nlc.backend.service.MembershipRegistrationService;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/user")
@RequiredArgsConstructor
public class UserController {

    private final BookingService bookingService;
    private final MemberCardService memberCardService;
    private final MembershipRegistrationService membershipRegistrationService;

    @PostMapping(value = "/bookings", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<BookingResponse> bookEvent(@AuthenticationPrincipal UserPrincipal principal,
                                                  @Valid @RequestPart("data") BookingRequest request,
                                                  @RequestPart(value = "paymentScreenshot", required = false)
                                                  MultipartFile paymentScreenshot) {
        return ApiResponse.success("Registration submitted",
                bookingService.createBooking(principal.getId(), request, paymentScreenshot));
    }

    @GetMapping("/bookings")
    public ApiResponse<List<BookingResponse>> myBookings(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Bookings fetched", bookingService.getUserBookings(principal.getId()));
    }

    @GetMapping("/member-card")
    public ApiResponse<MemberCardResponse> myMemberCard(@AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Member card fetched", memberCardService.getCardByUserId(principal.getId()));
    }

    /**
     * Returns the authenticated user's own membership-registration status. If
     * the user was created via the legacy /auth/register flow, their status is
     * APPROVED by default — this endpoint still returns the record.
     */
    @GetMapping("/membership-registration")
    public ApiResponse<MembershipRegistrationResponse> myMembershipRegistration(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Membership registration fetched",
                membershipRegistrationService.getOwnRegistration(principal.getId()));
    }
}
