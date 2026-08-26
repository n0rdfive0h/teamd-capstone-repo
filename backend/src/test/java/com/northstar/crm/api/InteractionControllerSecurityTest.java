package com.northstar.crm.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.northstar.crm.service.InteractionService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(InteractionController.class)
class InteractionControllerSecurityTest {

  @Autowired
  private MockMvc mvc;

  @MockBean
  private InteractionService interactionService;

  @Test
  void anonymousCreateUnauthorized() throws Exception {
    mvc.perform(post("/api/v1/interactions")
            .contentType(MediaType.APPLICATION_JSON)
            .content("""
                {
                  "customerId": "CUS-1001",
                  "interactionType": "NOTE",
                  "summary": "Requested address update",
                  "correlationId": "lab-request-001"
                }
                """))
        .andExpect(status().isUnauthorized());
  }
}
