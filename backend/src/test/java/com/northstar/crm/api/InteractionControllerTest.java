package com.northstar.crm.api;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;
import static org.mockito.ArgumentMatchers.any;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;

import com.northstar.crm.service.InteractionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.test.web.servlet.MockMvc;
import com.northstar.crm.api.dto.InteractionResponse;
import com.northstar.crm.domain.exception.CustomerNotFoundException;
import java.time.Instant;
import java.util.UUID;
import org.springframework.http.MediaType;


@WebMvcTest(InteractionController.class)
class InteractionControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private InteractionService interactionService;

    @Test
    void create_forAmina_returns201() throws Exception {
        var response = new InteractionResponse(
                UUID.randomUUID(), "CUS-1001", "NOTE", "Follow-up on billing question",
                "lab-request-001", Instant.now());

        when(interactionService.create(any(), any())).thenReturn(response);

        mockMvc.perform(post("/api/v1/interactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .header("X-Correlation-ID", "lab-request-001")
                        .content("""
              {
                "customerId": "CUS-1001",
                "interactionType": "NOTE",
                "summary": "Follow-up on billing question",
                "correlationId": "lab-request-001"
              }
              """))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.customerId").value("CUS-1001"))
                .andExpect(jsonPath("$.correlationId").value("lab-request-001"));
    }

    @Test
    void create_invalidInteractionType_returns400() throws Exception {
        mockMvc.perform(post("/api/v1/interactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
              {
                "customerId": "CUS-1001",
                "interactionType": "",
                "summary": "Should fail validation",
                "correlationId": "lab-request-001"
              }
              """))
                .andExpect(status().isBadRequest());
    }

    @Test
    void create_unknownCustomer_returns404() throws Exception {
        when(interactionService.create(any(), any()))
                .thenThrow(new CustomerNotFoundException("CUS-9999"));

        mockMvc.perform(post("/api/v1/interactions")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
              {
                "customerId": "CUS-9999",
                "interactionType": "NOTE",
                "summary": "Should fail",
                "correlationId": "lab-request-001"
              }
              """))
                .andExpect(status().isNotFound());
    }
}