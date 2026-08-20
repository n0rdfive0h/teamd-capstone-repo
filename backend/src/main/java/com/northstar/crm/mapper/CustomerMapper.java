package com.northstar.crm.mapper;

import com.northstar.crm.api.dto.CustomerResponse;
import com.northstar.crm.domain.Customer;
import org.springframework.stereotype.Component;

@Component
public class CustomerMapper {

    public CustomerResponse toResponse(Customer customer) {
        return new CustomerResponse(
                customer.getCustomerId(),
                customer.getFullName(),
                customer.getStatus(),
                customer.getEmail());
    }
}