package com.nlc.backend.dto.user;

import java.time.LocalDateTime;
import java.util.Set;

public record UserResponse(
        Long id,
        String fullName,
        String email,
        String phoneNumber,
        String city,
        String profession,
        boolean blocked,
        boolean emailVerified,
        boolean memberCardIssued,
        Set<String> roles,
        LocalDateTime createdAt
) {
}
