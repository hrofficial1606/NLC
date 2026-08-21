package com.nlc.backend.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

@Getter
@Setter
@Validated
@ConfigurationProperties(prefix = "app")
public class AppProperties {

    private final Security security = new Security();
    private final Integrations integrations = new Integrations();
    private final Frontend frontend = new Frontend();
    private final Notifications notifications = new Notifications();
    private final Membership membership = new Membership();

    @Getter
    @Setter
    public static class Security {
        private final Jwt jwt = new Jwt();
        private final Cors cors = new Cors();
    }

    @Getter
    @Setter
    public static class Jwt {
        @NotBlank
        private String issuer;
        @NotBlank
        private String accessTokenSecret;
        @NotBlank
        private String refreshTokenSecret;
        private long accessTokenExpirationMinutes;
        private long refreshTokenExpirationDays;
    }

    @Getter
    @Setter
    public static class Cors {
        @NotEmpty
        private List<String> allowedOrigins = new ArrayList<>();
    }

    @Getter
    @Setter
    public static class Integrations {
        private final Instagram instagram = new Instagram();
        private final Whatsapp whatsapp = new Whatsapp();
    }

    @Getter
    @Setter
    public static class Instagram {
        private boolean enabled;
        private String accessToken;
        private String userId;
        private String apiBaseUrl;
        private String syncCron;
    }

    @Getter
    @Setter
    public static class Whatsapp {
        private boolean enabled;
        private String apiBaseUrl;
        private String accessToken;
        private String phoneNumberId;
        private String defaultCountryCode;
        private String adminRecipientNumber;
    }

    @Getter
    @Setter
    public static class Frontend {
        private String baseUrl;
    }

    @Getter
    @Setter
    public static class Notifications {
        private boolean bookingEmailEnabled;
    }

    /**
     * Membership registration payment configuration. Reuses the same payment
     * model as paid events: a static QR/UPI pair + a fixed membership fee.
     * No payment gateway integration — applicants pay externally and upload a
     * private screenshot for admin review.
     */
    @Getter
    @Setter
    public static class Membership {
        @NotBlank
        private String fee;
        @NotBlank
        private String upiId;
        private String qrImageUrl;
        private String paymentInstructions;
        private boolean enabled = true;
    }
}
