package com.nlc.backend.dto.auth;

import java.time.LocalDateTime;
import java.util.Set;

public record AuthResponse(
        Long userId,
        String fullName,
        String email,
        Set<String> roles,
        String accessToken,
        String refreshToken,
        LocalDateTime expiresAt
) {
}
