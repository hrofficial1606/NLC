package com.nlc.backend.controller;

import com.nlc.backend.dto.common.ApiResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationRequest;
import com.nlc.backend.dto.registration.MembershipRegistrationResponse;
import com.nlc.backend.security.UserPrincipal;
import com.nlc.backend.service.MembershipRegistrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

/**
 * Public membership registration endpoints. The submitter does not need to be
 * authenticated — they create their own account by submitting the form along
 * with a private payment screenshot (multipart). The status endpoint requires
 * auth and returns the caller's own record.
 */
@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class MembershipRegistrationController {

    private final MembershipRegistrationService membershipRegistrationService;

    @PostMapping(value = "/register-membership", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<MembershipRegistrationResponse> registerMembership(
            @Valid @RequestPart("data") MembershipRegistrationRequest request,
            @RequestPart("paymentScreenshot") MultipartFile paymentScreenshot) {
        return ApiResponse.success("Membership application submitted",
                membershipRegistrationService.submitRegistration(request, paymentScreenshot));
    }

    @GetMapping("/membership-registration/status")
    public ApiResponse<MembershipRegistrationResponse> ownStatus(
            @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.success("Membership registration status fetched",
                membershipRegistrationService.getOwnRegistration(principal.getId()));
    }
}
