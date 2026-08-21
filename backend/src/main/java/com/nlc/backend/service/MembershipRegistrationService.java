package com.nlc.backend.service;

import com.nlc.backend.dto.registration.MembershipRegistrationPaymentProofResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationRequest;
import com.nlc.backend.dto.registration.MembershipRegistrationResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationReviewRequest;
import java.util.List;
import org.springframework.web.multipart.MultipartFile;

public interface MembershipRegistrationService {
    MembershipRegistrationResponse submitRegistration(MembershipRegistrationRequest request, MultipartFile paymentScreenshot);

    MembershipRegistrationResponse getOwnRegistration(Long userId);

    List<MembershipRegistrationResponse> listAdminRegistrations(String status);

    MembershipRegistrationResponse approve(Long userId, Long adminUserId, MembershipRegistrationReviewRequest request);

    MembershipRegistrationResponse reject(Long userId, Long adminUserId, MembershipRegistrationReviewRequest request);

    MembershipRegistrationPaymentProofResponse generateAdminPaymentProof(Long userId);
}
