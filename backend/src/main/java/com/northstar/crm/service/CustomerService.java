package com.northstar.crm.service;

import com.northstar.crm.api.dto.CreateCustomerRequest;
import com.northstar.crm.api.dto.CustomerResponse;
import com.northstar.crm.domain.Customer;
import com.northstar.crm.domain.CustomerStatus;
import com.northstar.crm.domain.exception.CustomerNotFoundException;
import com.northstar.crm.domain.exception.IllegalStatusTransitionException;
import com.northstar.crm.mapper.CustomerMapper;
import com.northstar.crm.repo.CustomerRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class CustomerService {

    private static final Map<CustomerStatus, Set<CustomerStatus>> LEGAL_TRANSITIONS = Map.of(
            CustomerStatus.PROSPECT, Set.of(CustomerStatus.ACTIVE, CustomerStatus.CLOSED),
            CustomerStatus.ACTIVE, Set.of(CustomerStatus.CLOSED),
            CustomerStatus.CLOSED, Set.of());

    private final CustomerRepository customerRepository;
    private final CustomerMapper mapper;

    public CustomerService(CustomerRepository customerRepository, CustomerMapper mapper) {
        this.customerRepository = customerRepository;
        this.mapper = mapper;
    }

    @Transactional
    public CustomerResponse create(CreateCustomerRequest request) {
        String nextId = generateNextCustomerId();

        Customer customer = new Customer();
        customer.setCustomerId(nextId);
        customer.setFullName(request.fullName());
        customer.setEmail(request.email());
        customer.setStatus(CustomerStatus.PROSPECT);

        Customer saved = customerRepository.save(customer);
        return mapper.toResponse(saved);
    }

    public CustomerResponse getById(String customerId) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));
        return mapper.toResponse(customer);
    }

    public List<CustomerResponse> search(String query) {
        return customerRepository.findById(query)
                .map(List::of)
                .orElseGet(() -> customerRepository.findByFullNameContainingIgnoreCase(query))
                .stream()
                .map(mapper::toResponse)
                .toList();
    }

    @Transactional
    public CustomerResponse updateStatus(String customerId, CustomerStatus newStatus) {
        Customer customer = customerRepository.findById(customerId)
                .orElseThrow(() -> new CustomerNotFoundException(customerId));

        CustomerStatus currentStatus = customer.getStatus();
        if (!LEGAL_TRANSITIONS.get(currentStatus).contains(newStatus)) {
            throw new IllegalStatusTransitionException(currentStatus, newStatus);
        }

        customer.setStatus(newStatus);
        Customer saved = customerRepository.save(customer);
        return mapper.toResponse(saved);
    }

    private String generateNextCustomerId() {
        Integer maxNumber = customerRepository.findMaxCustomerIdNumber();
        int next = (maxNumber == null ? 1000 : maxNumber) + 1;
        return "CUS-" + next;
    }
}