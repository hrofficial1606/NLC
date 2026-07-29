package com.nlc.backend.service;

import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.MemberCard;
import com.nlc.backend.entity.User;

public interface WhatsAppService {
    void sendText(String phoneNumber, String message);
    void sendRegistrationConfirmation(User user);
    void sendBookingConfirmation(User user, Booking booking);
    void sendMemberCardIssued(User user, MemberCard memberCard);
}
