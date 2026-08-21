package com.nlc.backend.dto.registration;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;

/**
 * Public membership registration payload (multipart "data" part).
 *
 * Reuses the same field set as {@code RegisterRequest} for compatibility with
 * the existing account model. The {@code paymentAmount} is informational only;
 * the actual amount is decided by the configured membership fee — admins can
 * still override per-application.
 */
public record MembershipRegistrationRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10,15}$") String phoneNumber,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 120) String city,
        @Size(max = 160) String profession,
        @Size(max = 255) String instagramProfile,
        @NotNull @Positive BigDecimal paymentAmount
) {
}
