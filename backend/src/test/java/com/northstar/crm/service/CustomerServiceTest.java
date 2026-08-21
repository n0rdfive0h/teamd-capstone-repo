package com.northstar.crm.service;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

import com.northstar.crm.api.dto.CreateCustomerRequest;
import com.northstar.crm.api.dto.CustomerResponse;
import com.northstar.crm.domain.Customer;
import com.northstar.crm.domain.CustomerStatus;
import com.northstar.crm.domain.exception.CustomerNotFoundException;
import com.northstar.crm.domain.exception.IllegalStatusTransitionException;
import com.northstar.crm.mapper.CustomerMapper;
import com.northstar.crm.repo.CustomerRepository;
import java.util.Optional;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

class CustomerServiceTest {

    private CustomerRepository customerRepository;
    private CustomerMapper mapper;
    private CustomerService service;

    @BeforeEach
    void setUp() {
        customerRepository = mock(CustomerRepository.class);
        mapper = mock(CustomerMapper.class);
        service = new CustomerService(customerRepository, mapper);
    }

    @Test
    void create_generatesNextSequentialId() {
        when(customerRepository.findMaxCustomerIdNumber()).thenReturn(1002);
        Customer saved = new Customer();
        saved.setCustomerId("CUS-1003");
        saved.setFullName("New Customer");
        saved.setEmail("new@example.test");
        saved.setStatus(CustomerStatus.PROSPECT);

        when(customerRepository.save(any())).thenReturn(saved);
        when(mapper.toResponse(saved))
                .thenReturn(new CustomerResponse("CUS-1003", "New Customer", CustomerStatus.PROSPECT, "new@example.test"));

        CustomerResponse response = service.create(new CreateCustomerRequest("New Customer", "new@example.test"));

        assertEquals("CUS-1003", response.customerId());
        assertEquals(CustomerStatus.PROSPECT, response.status());
    }

    @Test
    void getById_unknownCustomer_throws() {
        when(customerRepository.findById("CUS-9999")).thenReturn(Optional.empty());

        assertThrows(CustomerNotFoundException.class, () -> service.getById("CUS-9999"));
    }

    @Test
    void updateStatus_prospectToActive_isLegal() {
        Customer customer = new Customer();
        customer.setCustomerId("CUS-1002");
        customer.setStatus(CustomerStatus.PROSPECT);

        when(customerRepository.findById("CUS-1002")).thenReturn(Optional.of(customer));
        when(customerRepository.save(customer)).thenReturn(customer);
        when(mapper.toResponse(customer))
                .thenReturn(new CustomerResponse("CUS-1002", "Ravi Singh", CustomerStatus.ACTIVE, "ravi@example.test"));

        CustomerResponse response = service.updateStatus("CUS-1002", CustomerStatus.ACTIVE);

        assertEquals(CustomerStatus.ACTIVE, response.status());
    }

    @Test
    void updateStatus_activeToProspect_isIllegal() {
        Customer customer = new Customer();
        customer.setCustomerId("CUS-1001");
        customer.setStatus(CustomerStatus.ACTIVE);

        when(customerRepository.findById("CUS-1001")).thenReturn(Optional.of(customer));

        assertThrows(
                IllegalStatusTransitionException.class,
                () -> service.updateStatus("CUS-1001", CustomerStatus.PROSPECT));
    }

    @Test
    void updateStatus_activeToActive_isIllegal() {
        Customer customer = new Customer();
        customer.setCustomerId("CUS-1001");
        customer.setStatus(CustomerStatus.ACTIVE);

        when(customerRepository.findById("CUS-1001")).thenReturn(Optional.of(customer));

        assertThrows(
                IllegalStatusTransitionException.class,
                () -> service.updateStatus("CUS-1001", CustomerStatus.ACTIVE));
    }
}