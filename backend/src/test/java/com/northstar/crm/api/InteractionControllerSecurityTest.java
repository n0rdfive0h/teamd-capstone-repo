package com.northstar.crm.api;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.TestPropertySource;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders;

import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@TestPropertySource(properties = {
        "spring.flyway.enabled=false",
        "spring.datasource.url=jdbc:h2:mem:testdb;DB_CLOSE_DELAY=-1",
        "spring.datasource.driverClassName=org.h2.Driver",
        "spring.jpa.database-platform=org.hibernate.dialect.H2Dialect",
        "management.auditevents.enabled=false",
        "spring.jpa.hibernate.ddl-auto=none"
})
class InteractionControllerSecurityTest {

  @Autowired
  private MockMvc mockMvc;

  @Test
  void anonymousCreateUnauthorized() throws Exception {

    String body = """
            {
              "customerId": "CUS-1001",
              "interactionType": "NOTE",
              "summary": "Requested address update",
              "correlationId": "lab-request-001"
            }
            """;

    mockMvc.perform(
            MockMvcRequestBuilders.post("/api/v1/interactions")
                    .contentType(MediaType.APPLICATION_JSON)
                    .content(body)
    ).andExpect(status().isUnauthorized());
  }
}
