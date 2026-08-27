package com.northstar.crm.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.northstar.crm.api.dto.CustomerResponse;
import com.northstar.crm.domain.CustomerStatus;
import com.northstar.crm.domain.exception.CustomerNotFoundException;
import com.northstar.crm.domain.exception.IllegalStatusTransitionException;
import com.northstar.crm.service.CustomerService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(CustomerController.class)
@AutoConfigureMockMvc(addFilters = false)
class CustomerControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private CustomerService customerService;

    @Test
    void create_validRequest_returns201() throws Exception {
        var response = new CustomerResponse("CUS-1003", "New Customer", CustomerStatus.PROSPECT, "new@example.test");
        when(customerService.create(any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/customers")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {"fullName":"New Customer","email":"new@example.test"}
                """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value("CUS-1003"));
    }

    @Test
    void getById_unknownCustomer_returns404() throws Exception {
        when(customerService.getById("CUS-9999")).thenThrow(new CustomerNotFoundException("CUS-9999"));

        mockMvc.perform(get("/api/v1/customers/CUS-9999"))
                .andExpect(status().isNotFound());
    }

    @Test
    void updateStatus_illegalTransition_returns409() throws Exception {
        when(customerService.updateStatus(eq("CUS-1001"), eq(CustomerStatus.PROSPECT)))
                .thenThrow(new IllegalStatusTransitionException(CustomerStatus.ACTIVE, CustomerStatus.PROSPECT));

        mockMvc.perform(patch("/api/v1/customers/CUS-1001/status")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {"newStatus":"PROSPECT"}
                """))
                .andExpect(status().isConflict());
    }
}
