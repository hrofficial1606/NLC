package com.nlc.backend.dto.membercard;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;

public record MemberCardRequest(
        @NotNull Long userId,
        @NotBlank @Size(max = 80) String membershipPlan,
        @Size(max = 120) String designation,
        @NotNull LocalDate validFrom,
        @NotNull @Future LocalDate validUntil,
        @Size(max = 120) String accentColor,
        @Size(max = 500) String notes,
        boolean active
) {
}
