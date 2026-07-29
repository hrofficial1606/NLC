package com.nlc.backend.util;

import com.nlc.backend.entity.MemberCard;
import com.nlc.backend.entity.User;
import java.nio.charset.StandardCharsets;
import java.time.format.DateTimeFormatter;
import java.util.Base64;

public final class MemberCardUtil {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd MMM yyyy");

    private MemberCardUtil() {
    }

    public static String generateCardImage(User user, MemberCard memberCard) {
        String accentColor = safe(memberCard.getAccentColor(), "#A31D8B");
        String svg = """
                <svg xmlns="http://www.w3.org/2000/svg" width="900" height="540" viewBox="0 0 900 540">
                  <defs>
                    <linearGradient id="cardBg" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stop-color="#0B1C3D"/>
                      <stop offset="100%" stop-color="%s"/>
                    </linearGradient>
                  </defs>
                  <rect width="900" height="540" rx="36" fill="url(#cardBg)"/>
                  <circle cx="760" cy="92" r="84" fill="rgba(255,255,255,0.08)"/>
                  <circle cx="125" cy="430" r="110" fill="rgba(255,255,255,0.08)"/>
                  <text x="66" y="96" fill="#FFFFFF" font-size="34" font-family="Poppins,Arial,sans-serif" font-weight="700">Nagpur Ladies Club</text>
                  <text x="66" y="138" fill="#F7D1F0" font-size="22" font-family="Poppins,Arial,sans-serif">Official Member Card</text>
                  <text x="66" y="230" fill="#FFFFFF" font-size="26" font-family="Poppins,Arial,sans-serif">Member Name</text>
                  <text x="66" y="276" fill="#FFFFFF" font-size="42" font-family="Poppins,Arial,sans-serif" font-weight="700">%s</text>
                  <text x="66" y="336" fill="#FFFFFF" font-size="24" font-family="Poppins,Arial,sans-serif">Plan: %s</text>
                  <text x="66" y="378" fill="#FFFFFF" font-size="24" font-family="Poppins,Arial,sans-serif">Designation: %s</text>
                  <text x="66" y="442" fill="#F7D1F0" font-size="22" font-family="Poppins,Arial,sans-serif">Card No: %s</text>
                  <text x="66" y="478" fill="#F7D1F0" font-size="22" font-family="Poppins,Arial,sans-serif">Valid till: %s</text>
                  <rect x="650" y="325" width="170" height="170" rx="18" fill="#FFFFFF"/>
                  <image href="%s" x="670" y="345" width="130" height="130"/>
                </svg>
                """.formatted(
                accentColor,
                escape(user.getFullName()),
                escape(memberCard.getMembershipPlan()),
                escape(safe(memberCard.getDesignation(), "Member")),
                escape(memberCard.getCardNumber()),
                escape(memberCard.getValidUntil().format(DATE_FORMATTER)),
                memberCard.getQrCodeUrl()
        );
        return "data:image/svg+xml;base64," + Base64.getEncoder().encodeToString(svg.getBytes(StandardCharsets.UTF_8));
    }

    private static String safe(String value, String fallback) {
        return value == null || value.isBlank() ? fallback : value;
    }

    private static String escape(String value) {
        return value
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
    }
}
