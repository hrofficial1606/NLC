package com.nlc.backend.dto.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Size(min = 3, max = 120) String fullName,
        @NotBlank @Email String email,
        @NotBlank @Pattern(regexp = "^[0-9]{10,15}$") String phoneNumber,
        @NotBlank @Size(min = 8, max = 100) String password,
        @Size(max = 120) String city,
        @Size(max = 160) String profession,
        @Size(max = 255) String instagramProfile
) {
}
