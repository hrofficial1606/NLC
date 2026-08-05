package com.nlc.backend.service.impl;

import com.nlc.backend.config.StorageProperties;
import com.nlc.backend.dto.booking.BookingRequest;
import com.nlc.backend.dto.booking.BookingReviewRequest;
import com.nlc.backend.dto.booking.BookingResponse;
import com.nlc.backend.dto.booking.PaymentProofResponse;
import com.nlc.backend.dto.upload.StorageUploadResult;
import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.Event;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.enums.BookingStatus;
import com.nlc.backend.exception.BadRequestException;
import com.nlc.backend.exception.ResourceNotFoundException;
import com.nlc.backend.repository.BookingRepository;
import com.nlc.backend.repository.EventRepository;
import com.nlc.backend.repository.UserRepository;
import com.nlc.backend.service.BookingService;
import com.nlc.backend.service.EmailService;
import com.nlc.backend.service.NotificationService;
import com.nlc.backend.service.StorageService;
import com.nlc.backend.service.WhatsAppService;
import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private static final long MAX_SCREENSHOT_SIZE_BYTES = 5L * 1024 * 1024;
    private static final List<String> ALLOWED_SCREENSHOT_TYPES = List.of(
            "image/jpeg", "image/jpg", "image/png", "image/webp"
    );

    private final BookingRepository bookingRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final StorageService storageService;
    private final StorageProperties storageProperties;
    private final NotificationService notificationService;
    private final WhatsAppService whatsAppService;

    @Override
    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request, MultipartFile paymentScreenshot) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Event event = eventRepository.findById(request.eventId())
                .orElseThrow(() -> new ResourceNotFoundException("Event not found"));

        validateRegistrationAvailability(event, request.quantity());

        Booking booking = bookingRepository.findByUserIdAndEventId(userId, event.getId())
                .map(existing -> prepareExistingRegistration(existing, event))
                .orElseGet(Booking::new);

        if (booking.getId() == null) {
            booking.setBookingReference("NLC-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase(Locale.ROOT));
            booking.setUser(user);
            booking.setEvent(event);
        }

        booking.setQuantity(request.quantity());
        booking.setTotalAmount(event.getTicketPrice().multiply(BigDecimal.valueOf(request.quantity())));
        booking.setAttendeeNotes(request.attendeeNotes());
        booking.setSubmittedAt(LocalDateTime.now());
        booking.setReviewedAt(null);
        booking.setReviewedBy(null);
        booking.setAdminNote(null);
        booking.setRejectionReason(null);

        if (event.isPaidEvent()) {
            if (paymentScreenshot == null || paymentScreenshot.isEmpty()) {
                throw new BadRequestException("Payment screenshot is required for paid events");
            }
            validateScreenshot(paymentScreenshot);
            String previousKey = booking.getPaymentScreenshotObjectKey();
            if (previousKey != null && !previousKey.isBlank()) {
                storageService.delete(StorageService.PRIVATE_BUCKET, previousKey);
            }
            StorageUploadResult upload = storageService.uploadPrivate(
                    paymentScreenshot, "payment-proofs", UUID.randomUUID().toString());
            booking.setPaymentScreenshotObjectKey(upload.objectKey());
            booking.setStatus(BookingStatus.PENDING);
        } else {
            booking.setPaymentScreenshotObjectKey(null);
            booking.setStatus(BookingStatus.APPROVED);
            reserveApprovedSeats(event, request.quantity());
        }

        Booking saved = bookingRepository.save(booking);
        eventRepository.save(event);

        if (saved.getStatus() == BookingStatus.APPROVED) {
            emailService.sendBookingConfirmation(user.getEmail(), saved.getBookingReference(), "");
            notificationService.notifyUser(user.getId(), "Registration approved",
                    "Your registration " + saved.getBookingReference() + " has been approved.", "BOOKING_CONFIRMED");
            whatsAppService.sendBookingConfirmation(user, saved);
        } else {
            notificationService.notifyUser(user.getId(), "Registration pending",
                    "Your payment proof for " + saved.getBookingReference() + " is under review.", "BOOKING_CONFIRMED");
        }
        return toResponse(saved);
    }

    @Override
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUserIdOrderByCreatedAtDesc(userId).stream().map(this::toResponse).toList();
    }

    @Override
    public List<BookingResponse> getAllBookings(String status) {
        if (status == null || status.isBlank()) {
            return bookingRepository.findAll().stream().map(this::toResponse).toList();
        }
        BookingStatus bookingStatus = BookingStatus.valueOf(status.toUpperCase(Locale.ROOT));
        return bookingRepository.findByStatusOrderByCreatedAtDesc(bookingStatus).stream().map(this::toResponse).toList();
    }

    @Override
    @Transactional
    public BookingResponse approveBooking(Long bookingId, Long adminUserId, BookingReviewRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (booking.getStatus() == BookingStatus.APPROVED) {
            throw new BadRequestException("Registration is already approved");
        }
        Event event = booking.getEvent();
        validateRegistrationAvailability(event, booking.getQuantity());
        reserveApprovedSeats(event, booking.getQuantity());

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        booking.setStatus(BookingStatus.APPROVED);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setReviewedBy(admin);
        booking.setAdminNote(request == null ? null : request.adminNote());
        booking.setRejectionReason(null);

        Booking saved = bookingRepository.save(booking);
        eventRepository.save(event);

        emailService.sendBookingConfirmation(saved.getUser().getEmail(), saved.getBookingReference(), "");
        notificationService.notifyUser(saved.getUser().getId(), "Registration approved",
                "Your registration " + saved.getBookingReference() + " has been approved.", "BOOKING_CONFIRMED");
        whatsAppService.sendBookingConfirmation(saved.getUser(), saved);
        return toResponse(saved);
    }

    @Override
    @Transactional
    public BookingResponse rejectBooking(Long bookingId, Long adminUserId, BookingReviewRequest request) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        if (request == null || request.rejectionReason() == null || request.rejectionReason().isBlank()) {
            throw new BadRequestException("Rejection reason is required");
        }

        User admin = userRepository.findById(adminUserId)
                .orElseThrow(() -> new ResourceNotFoundException("Admin user not found"));
        booking.setStatus(BookingStatus.REJECTED);
        booking.setReviewedAt(LocalDateTime.now());
        booking.setReviewedBy(admin);
        booking.setAdminNote(request.adminNote());
        booking.setRejectionReason(request.rejectionReason());

        return toResponse(bookingRepository.save(booking));
    }

    private void validateRegistrationAvailability(Event event, Integer requestedQuantity) {
        if (!event.isRegistrationEnabled()) {
            throw new BadRequestException("Registration is disabled for this event");
        }
        if (event.getRegistrationDeadline() != null && event.getRegistrationDeadline().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("Registration deadline has passed");
        }
        if (!event.isAvailable() || event.getEventDate().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("This event is not open for registration");
        }
        if (event.getTotalSeats() != null && event.getTotalSeats() > 0 && event.getAvailableSeats() < requestedQuantity) {
            throw new BadRequestException("Not enough seats available");
        }
    }

    private Booking prepareExistingRegistration(Booking existing, Event event) {
        if (existing.getStatus() == BookingStatus.APPROVED) {
            throw new BadRequestException("You are already registered for this event");
        }
        if (existing.getStatus() == BookingStatus.PENDING) {
            throw new BadRequestException("Your registration is already under review");
        }
        if (existing.getStatus() == BookingStatus.REJECTED) {
            return existing;
        }
        if (!event.isPaidEvent()) {
            throw new BadRequestException("This registration cannot be submitted again");
        }
        return existing;
    }

    private void reserveApprovedSeats(Event event, Integer quantity) {
        event.setAvailableSeats(Math.max(0, event.getAvailableSeats() - quantity));
    }

    private void validateScreenshot(MultipartFile file) {
        if (file.getSize() > MAX_SCREENSHOT_SIZE_BYTES) {
            throw new BadRequestException("Screenshot must be 5MB or smaller");
        }
        if (file.getContentType() == null || !ALLOWED_SCREENSHOT_TYPES.contains(file.getContentType().toLowerCase(Locale.ROOT))) {
            throw new BadRequestException("Only JPG, JPEG, PNG, and WEBP screenshots are allowed");
        }
    }

    private BookingResponse toResponse(Booking booking) {
        return toResponse(booking, false);
    }

    private BookingResponse toResponse(Booking booking, boolean viewerIsAdmin) {
        String key = booking.getPaymentScreenshotObjectKey();
        boolean hasProof = key != null && !key.isBlank();
        return new BookingResponse(
                booking.getId(),
                booking.getBookingReference(),
                booking.getEvent().getId(),
                booking.getEvent().getTitle(),
                booking.getQuantity(),
                booking.getTotalAmount(),
                booking.getStatus().name(),
                booking.getEvent().isPaidEvent(),
                hasProof,
                booking.getRejectionReason(),
                booking.getAdminNote(),
                booking.getSubmittedAt(),
                booking.getReviewedAt(),
                booking.getCreatedAt()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public PaymentProofResponse generateAdminPaymentProof(Long bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Registration not found"));
        String objectKey = booking.getPaymentScreenshotObjectKey();
        if (objectKey == null || objectKey.isBlank()) {
            throw new ResourceNotFoundException("No payment proof uploaded for this registration");
        }
        int ttl = storageProperties.getSupabase().getSignedUrlTtlSeconds();
        String signedUrl = storageService.resolveViewUrl(StorageService.PRIVATE_BUCKET, objectKey);
        if (signedUrl == null || signedUrl.isBlank()) {
            throw new IllegalStateException("Unable to generate signed URL for payment proof");
        }
        return new PaymentProofResponse(
                booking.getId(),
                booking.getBookingReference(),
                signedUrl,
                Instant.now().plusSeconds(ttl),
                ttl
        );
    }
}
