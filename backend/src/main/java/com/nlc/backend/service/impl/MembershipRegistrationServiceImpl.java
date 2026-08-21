package com.nlc.backend.service.impl;

import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.dto.registration.MembershipRegistrationPaymentProofResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationRequest;
import com.nlc.backend.dto.registration.MembershipRegistrationResponse;
import com.nlc.backend.dto.registration.MembershipRegistrationReviewRequest;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.entity.Role;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.enums.AuthProvider;
import com.nlc.backend.entity.enums.RegistrationStatus;
import com.nlc.backend.entity.enums.RoleType;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.RoleRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.EmailService;
import com.nlc.backend.service.MembershipRegistrationService;
import com.nlc.backend.service.NotificationService;
import com.nlc.backend.service.StorageService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

/**
 * Service for membership registration with payment verification.
 *
 * Mirrors the design used for paid-event bookings: payment proof is uploaded to
 * the PRIVATE Supabase bucket and only a short-lived signed URL is ever exposed
 * (admin-only). Cloudinary is never used for membership payment screenshots.
 *
 * New registrations start as {@link RegistrationStatus#PENDING}; existing users
 * remain {@link RegistrationStatus#APPROVED} thanks to the column default and
 * the entity field initializer on User.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MembershipRegistrationServiceImpl implements MembershipRegistrationService {

    private static final long MAX_SCREENSHOT_SIZE_BYTES = 5L * 1024 * 1024;
    private static final List<String> ALLOWED_SCREENSHOT_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final StorageService storageService;
    private final StorageProperties storageProperties;
    private final PasswordEncoder passwordEncoder;
    private final EmailService emailService;
    private final NotificationService notificationService;

    @Override
    @Transactional
    public MembershipRegistrationResponse submitRegistration(MembershipRegistrationRequest request,
                                                              MultipartFile paymentScreenshot) {
        String emailLower = request.email().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmailIgnoreCase(emailLower)) {
            throw new BadRequestException("Email already registered. Please sign in or use a different email.");
        }

        if (paymentScreenshot == null || paymentScreenshot.isEmpty()) {
            throw new BadRequestException("Payment screenshot is required for membership registration");
        }
        validateScreenshot(paymentScreenshot);

        Role userRole = roleRepository.findByName(RoleType.USER)
                .orElseThrow(() -> new ResourceNotFoundException("Default USER role not found"));

        // Upload the screenshot to the private bucket first; if creation fails
        // afterwards we delete the orphan object so storage does not leak.
        StorageUploadResult upload = storageService.uploadPrivate(
                paymentScreenshot, "membership-payments", UUID.randomUUID().toString());

        try {
            User user = new User();
            user.setFullName(request.fullName());
            user.setEmail(emailLower);
            user.setPhoneNumber(request.phoneNumber());
            user.setPassword(passwordEncoder.encode(request.password()));
            user.setCity(request.city());
            user.setProfession(request.profession());
            user.setInstagramProfile(request.instagramProfile());
            user.setProvider(AuthProvider.LOCAL);
            user.setRoles(java.util.Set.of(userRole));

            // Membership-registration specific fields.
            user.setRegistrationStatus(RegistrationStatus.PENDING);
            user.setRegistrationPaymentObjectKey(upload.objectKey());
            user.setRegistrationPaymentAmount(request.paymentAmount());
            user.setRegistrationSubmittedAt(LocalDateTime.now());

            User saved = userRepository.save(user);

            try {
                emailService.sendRegistrationReceivedEmail(saved.getEmail(), saved.getFullName());
            } catch (Exception ex) {
                // Email failure should not block registration; just log.
                log.warn("Could not queue registration-received email for {}: {}",
                        saved.getEmail(), ex.getMessage());
            }

            notificationService.notifyUser(saved.getId(),
                    "Membership application received",
                    "Your membership application has been received and is pending payment verification.",
                    "MEMBERSHIP_REGISTRATION_PENDING");

            return toResponse(saved);
        } catch (RuntimeException ex) {
            // Best-effort cleanup of the uploaded object on failure.
            try {
                storageService.delete(StorageService.PRIVATE_BUCKET, upload.objectKey());
            } catch (Exception cleanupEx) {
                log.warn("Failed to clean up membership payment upload {}: {}",
                        upload.objectKey(), cleanupEx.getMessage());
            }
            throw ex;
        }
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipRegistrationResponse getOwnRegistration(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        return toResponse(user);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MembershipRegistrationResponse> listAdminRegistrations(String status) {
        List<User> users = userRepository.findAll();
        return users.stream()
                .map(this::toResponse)
                .filter(resp -> status == null || status.isBlank()
                        || resp.registrationStatus().equalsIgnoreCase(status))
                .toList();
    }

    @Override
    @Transactional
    public MembershipRegistrationResponse approve(Long userId, Long adminUserId,
                                                  MembershipRegistrationReviewRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership application not found"));

        if (user.getRegistrationStatus() == RegistrationStatus.APPROVED) {
            throw new BadRequestException("Membership application is already approved");
        }
        if (user.getRegistrationStatus() == RegistrationStatus.REJECTED) {
            throw new BadRequestException("Membership application was rejected and cannot be approved");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        user.setRegistrationStatus(RegistrationStatus.APPROVED);
        user.setRegistrationReviewedAt(LocalDateTime.now());
        user.setRegistrationReviewedBy(admin);
        user.setRegistrationRejectionReason(null);
        if (request != null) {
            user.setRegistrationAdminNote(request.adminNote());
        }
        User saved = userRepository.save(user);

        try {
            emailService.sendMembershipApprovedEmail(saved.getEmail(), saved.getFullName());
        } catch (Exception ex) {
            log.warn("Could not send approval email to {}: {}", saved.getEmail(), ex.getMessage());
        }
        notificationService.notifyUser(saved.getId(), "Membership approved",
                "Welcome to Nagpur Ladies Club — your membership has been approved.",
                "MEMBERSHIP_APPROVED");

        return toResponse(saved);
    }

    @Override
    @Transactional
    public MembershipRegistrationResponse reject(Long userId, Long adminUserId,
                                                 MembershipRegistrationReviewRequest request) {
        if (request == null || request.rejectionReason() == null || request.rejectionReason().isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership application not found"));
        if (user.getRegistrationStatus() == RegistrationStatus.APPROVED) {
            throw new BadRequestException("Membership application is already approved and cannot be rejected");
        }
        if (user.getRegistrationStatus() == RegistrationStatus.REJECTED) {
            throw new BadRequestException("Membership application is already rejected");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));

        user.setRegistrationStatus(RegistrationStatus.REJECTED);
        user.setRegistrationReviewedAt(LocalDateTime.now());
        user.setRegistrationReviewedBy(admin);
        user.setRegistrationRejectionReason(request.rejectionReason());
        user.setRegistrationAdminNote(request.adminNote());
        User saved = userRepository.save(user);

        try {
            emailService.sendMembershipRejectedEmail(saved.getEmail(), saved.getFullName(),
                    request.rejectionReason());
        } catch (Exception ex) {
            log.warn("Could not send rejection email to {}: {}", saved.getEmail(), ex.getMessage());
        }
        notificationService.notifyUser(saved.getId(), "Membership rejected",
                "Your membership application was not approved.",
                "MEMBERSHIP_REJECTED");

        return toResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public MembershipRegistrationPaymentProofResponse generateAdminPaymentProof(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Membership application not found"));
        String objectKey = user.getRegistrationPaymentObjectKey();
        if (objectKey == null || objectKey.isBlank()) {
            throw new ResourceNotFoundException("No payment proof uploaded for this application");
        }
        int ttl = storageProperties.getSupabase().getSignedUrlTtlSeconds();
        String signedUrl = storageService.resolveViewUrl(StorageService.PRIVATE_BUCKET, objectKey);
        if (signedUrl == null || signedUrl.isBlank()) {
            throw new IllegalStateException("Unable to generate signed URL for payment proof");
        }
        return new MembershipRegistrationPaymentProofResponse(
                user.getId(),
                user.getEmail(),
                signedUrl,
                Instant.now().plusSeconds(ttl),
                ttl
        );
    }

    private void validateScreenshot(MultipartFile file) {
        if (file.getSize() > MAX_SCREENSHOT_SIZE_BYTES) {
            throw new BadRequestException("Screenshot must be 5MB or smaller");
        }
        String type = file.getContentType();
        if (type == null || !ALLOWED_SCREENSHOT_TYPES.contains(type.toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Only JPG, JPEG, PNG, and WEBP screenshots are allowed");
        }
    }

    private MembershipRegistrationResponse toResponse(User user) {
        BigDecimal amount = user.getRegistrationPaymentAmount();
        boolean hasProof = user.getRegistrationPaymentObjectKey() != null
                && !user.getRegistrationPaymentObjectKey().isBlank();
        RegistrationStatus status = user.getRegistrationStatus() == null
                ? RegistrationStatus.APPROVED
                : user.getRegistrationStatus();
        return new MembershipRegistrationResponse(
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getPhoneNumber(),
                user.getCity(),
                user.getProfession(),
                status.name(),
                hasProof,
                amount,
                user.getRegistrationRejectionReason(),
                user.getRegistrationAdminNote(),
                user.getRegistrationSubmittedAt(),
                user.getRegistrationReviewedAt(),
                user.getCreatedAt()
        );
    }
}
