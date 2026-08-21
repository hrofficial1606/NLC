package com.nlc.backend.service.impl;

import com.nlc.backend.service.EmailService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailServiceImpl implements EmailService {

    private final JavaMailSender mailSender;

    @Override
    @Async("applicationTaskExecutor")
    public void sendVerificationEmail(String email, String verificationToken) {
        send(email, "Verify your email", "Verification token: " + verificationToken);
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendPasswordResetEmail(String email, String resetToken) {
        send(email, "Reset your password", "Reset token: " + resetToken);
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendBookingConfirmation(String email, String bookingReference, String qrCodeUrl) {
        send(email, "Booking confirmed", "Reference: " + bookingReference + "\nQR: " + qrCodeUrl);
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendContactNotification(String subject, String body) {
        log.info("Contact inquiry received: {} - {}", subject, body);
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendRegistrationReceivedEmail(String email, String fullName) {
        send(email, "Membership application received",
                "Hi " + (fullName == null ? "" : fullName) + ",\n\n" +
                        "Thank you for applying to join Nagpur Ladies Club. " +
                        "Your membership application and payment proof have been received and are under review.\n\n" +
                        "You will receive another email once an administrator has reviewed your application.\n\n" +
                        "— Nagpur Ladies Club");
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendMembershipApprovedEmail(String email, String fullName) {
        send(email, "Welcome to Nagpur Ladies Club",
                "Hi " + (fullName == null ? "" : fullName) + ",\n\n" +
                        "Your membership application has been approved. Welcome to the club!\n\n" +
                        "— Nagpur Ladies Club");
    }

    @Override
    @Async("applicationTaskExecutor")
    public void sendMembershipRejectedEmail(String email, String fullName, String rejectionReason) {
        send(email, "Membership application update",
                "Hi " + (fullName == null ? "" : fullName) + ",\n\n" +
                        "Thank you for applying. Unfortunately your membership application was not approved.\n\n" +
                        "Reason: " + (rejectionReason == null ? "Not provided" : rejectionReason) + "\n\n" +
                        "If you believe this was a mistake, please contact the club.\n\n" +
                        "— Nagpur Ladies Club");
    }

    private void send(String to, String subject, String body) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setTo(to);
            message.setSubject(subject);
            message.setText(body);
            mailSender.send(message);
        } catch (Exception ex) {
            log.warn("Email send skipped: {}", ex.getMessage());
        }
    }
}
