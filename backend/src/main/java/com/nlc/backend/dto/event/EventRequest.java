package com.nlc.backend.dto.event;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.math.BigDecimal;
import java.time.LocalDateTime;

public record EventRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 300) String slug,
        @NotBlank String description,
        @Size(max = 180) String shortDescription,
        @NotNull @Future LocalDateTime eventDate,
        @NotBlank @Size(max = 180) String location,
        @NotNull @DecimalMin("0.0") BigDecimal ticketPrice,
        @NotNull @Min(0) Integer totalSeats,
        boolean registrationEnabled,
        boolean paidEvent,
        boolean featured,
        boolean available,
        String bannerImageUrl,
        String qrImageUrl,
        @Size(max = 120) String upiId,
        @Size(max = 1000) String paymentInstructions,
        LocalDateTime registrationDeadline,
        String status
) {
}
