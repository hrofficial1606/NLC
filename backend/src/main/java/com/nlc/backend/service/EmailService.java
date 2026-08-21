package com.nlc.backend.service;

public interface EmailService {
    void sendVerificationEmail(String email, String verificationToken);
    void sendPasswordResetEmail(String email, String resetToken);
    void sendBookingConfirmation(String email, String bookingReference, String qrCodeUrl);
    void sendContactNotification(String subject, String body);
    void sendRegistrationReceivedEmail(String email, String fullName);
    void sendMembershipApprovedEmail(String email, String fullName);
    void sendMembershipRejectedEmail(String email, String fullName, String rejectionReason);
}
