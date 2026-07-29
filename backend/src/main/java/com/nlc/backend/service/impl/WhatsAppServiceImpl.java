package com.nlc.backend.service.impl;

import com.nlc.backend.config.AppProperties;
import com.nlc.backend.entity.Booking;
import com.nlc.backend.entity.MemberCard;
import com.nlc.backend.entity.User;
import com.nlc.backend.service.WhatsAppService;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.Locale;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.json.JSONObject;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
@RequiredArgsConstructor
public class WhatsAppServiceImpl implements WhatsAppService {

    private final AppProperties appProperties;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    @Override
    @Async("applicationTaskExecutor")
    public void sendText(String phoneNumber, String message) {
        AppProperties.Whatsapp whatsapp = appProperties.getIntegrations().getWhatsapp();
        if (!whatsapp.isEnabled()) {
            log.info("WhatsApp integration disabled. Skipping message to {}", phoneNumber);
            return;
        }
        if (whatsapp.getAccessToken() == null || whatsapp.getAccessToken().isBlank()
                || whatsapp.getPhoneNumberId() == null || whatsapp.getPhoneNumberId().isBlank()) {
            log.warn("WhatsApp credentials missing. Skipping message to {}", phoneNumber);
            return;
        }

        String normalizedPhone = normalizePhoneNumber(phoneNumber, whatsapp.getDefaultCountryCode());
        JSONObject payload = new JSONObject();
        payload.put("messaging_product", "whatsapp");
        payload.put("recipient_type", "individual");
        payload.put("to", normalizedPhone);
        payload.put("type", "text");
        payload.put("text", new JSONObject().put("preview_url", false).put("body", message));

        String endpoint = whatsapp.getApiBaseUrl() + "/" + whatsapp.getPhoneNumberId() + "/messages";
        HttpRequest request = HttpRequest.newBuilder(URI.create(endpoint))
                .header("Authorization", "Bearer " + whatsapp.getAccessToken())
                .header("Content-Type", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(payload.toString(), StandardCharsets.UTF_8))
                .build();

        try {
            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            if (response.statusCode() >= 400) {
                log.warn("WhatsApp send failed for {}: {}", normalizedPhone, response.body());
            }
        } catch (Exception ex) {
            log.warn("WhatsApp send skipped for {}: {}", normalizedPhone, ex.getMessage());
        }
    }

    @Override
    public void sendRegistrationConfirmation(User user) {
        sendText(user.getPhoneNumber(),
                "Welcome to Nagpur Ladies Club, " + user.getFullName()
                        + ". Your registration was received successfully. Please verify your email to activate your account.");
        sendAdminAlertIfConfigured("New user registered: " + user.getFullName() + " (" + user.getEmail() + ")");
    }

    @Override
    public void sendBookingConfirmation(User user, Booking booking) {
        sendText(user.getPhoneNumber(),
                "Your booking is confirmed for " + booking.getEvent().getTitle()
                        + ". Booking Ref: " + booking.getBookingReference()
                        + ". Tickets: " + booking.getQuantity() + ".");
    }

    @Override
    public void sendMemberCardIssued(User user, MemberCard memberCard) {
        sendText(user.getPhoneNumber(),
                "Hello " + user.getFullName() + ", your Nagpur Ladies Club member card is ready. Card No: "
                        + memberCard.getCardNumber() + ". Plan: " + memberCard.getMembershipPlan() + ".");
    }

    private void sendAdminAlertIfConfigured(String message) {
        String adminNumber = appProperties.getIntegrations().getWhatsapp().getAdminRecipientNumber();
        if (adminNumber != null && !adminNumber.isBlank()) {
            sendText(adminNumber, message);
        }
    }

    private String normalizePhoneNumber(String phoneNumber, String defaultCountryCode) {
        String digits = phoneNumber == null ? "" : phoneNumber.replaceAll("[^0-9]", "");
        if (digits.startsWith("0")) {
            digits = digits.substring(1);
        }
        if (defaultCountryCode == null || defaultCountryCode.isBlank()) {
            return digits;
        }
        String normalizedCountryCode = defaultCountryCode.replaceAll("[^0-9]", "");
        if (digits.startsWith(normalizedCountryCode)) {
            return digits;
        }
        if (digits.length() == 10) {
            return normalizedCountryCode + digits;
        }
        return digits;
    }
}
