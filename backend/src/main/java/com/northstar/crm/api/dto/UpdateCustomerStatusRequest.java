package com.northstar.crm.api.dto;

import com.northstar.crm.domain.CustomerStatus;
import jakarta.validation.constraints.NotNull;

public record UpdateCustomerStatusRequest(
        @NotNull CustomerStatus newStatus
) {}