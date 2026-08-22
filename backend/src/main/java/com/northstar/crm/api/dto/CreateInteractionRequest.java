package com.northstar.crm.api.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.Instant;

public record CreateInteractionRequest(
    @NotBlank String customerId,
    @NotBlank String interactionType,
    @NotBlank @Size(max = 1000) String summary,
    String correlationId
) {}
