package com.northstar.crm.api;

import com.northstar.crm.api.dto.CreateCustomerRequest;
import com.northstar.crm.api.dto.CustomerResponse;
import com.northstar.crm.api.dto.UpdateCustomerStatusRequest;
import com.northstar.crm.service.CustomerService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerController {

    private final CustomerService customerService;

    public CustomerController(CustomerService customerService) {
        this.customerService = customerService;
    }

    @PostMapping("/api/v1/customers")
    public ResponseEntity<CustomerResponse> create(@Valid @RequestBody CreateCustomerRequest request) {
        CustomerResponse body = customerService.create(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(body);
    }

    @GetMapping("/api/v1/customers/{customerId}")
    public ResponseEntity<CustomerResponse> getById(@PathVariable String customerId) {
        return ResponseEntity.ok(customerService.getById(customerId));
    }

    @GetMapping("/api/v1/customers")
    public ResponseEntity<List<CustomerResponse>> search(@RequestParam String query) {
        return ResponseEntity.ok(customerService.search(query));
    }

    @PatchMapping("/api/v1/customers/{customerId}/status")
    public ResponseEntity<CustomerResponse> updateStatus(
            @PathVariable String customerId,
            @Valid @RequestBody UpdateCustomerStatusRequest request) {
        return ResponseEntity.ok(customerService.updateStatus(customerId, request.newStatus()));
    }
}