package com.nlc.backend.dto.booking;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record BookingRequest(
        @NotNull Long eventId,
        @NotNull @Min(1) Integer quantity,
        @Size(max = 1000) String attendeeNotes
) {
}
