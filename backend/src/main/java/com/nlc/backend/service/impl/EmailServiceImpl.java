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
