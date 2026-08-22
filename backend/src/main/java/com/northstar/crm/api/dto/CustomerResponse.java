package com.northstar.crm.api.dto;

import com.northstar.crm.domain.CustomerStatus;

public record CustomerResponse(
        String customerId,
        String fullName,
        CustomerStatus status,
        String email
) {}