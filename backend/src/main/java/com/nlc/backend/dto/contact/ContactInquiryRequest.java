package com.nlc.backend.dto.contact;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ContactInquiryRequest(
        @NotBlank @Size(max = 120) String name,
        @NotBlank @Email String email,
        @Size(max = 20) String phoneNumber,
        @NotBlank @Size(max = 180) String subject,
        @NotBlank String message
) {
}
