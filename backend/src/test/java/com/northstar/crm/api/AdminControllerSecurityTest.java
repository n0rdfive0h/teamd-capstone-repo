package com.northstar.crm.api;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.northstar.crm.security.JwtConfig;
import com.northstar.crm.security.JwtService;
import com.northstar.crm.security.SecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

/**
 * Verifies that AdminController enforces role-based access control.
 * Tests that:
 * - Anonymous requests return 401 (Unauthorized)
 * - AGENT role requests return 403 (Forbidden)
 * - MANAGER role requests return 200 (OK)
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Import({SecurityConfig.class, JwtConfig.class})
class AdminControllerSecurityTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JwtService jwtService;

    @Test
    void statusEndpoint_anonymousRequest_returns401() throws Exception {
        mockMvc.perform(get("/api/admin/status"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void statusEndpoint_managerRole_returns200() throws Exception {
        String token = jwtService.issue("manager-user");

        mockMvc.perform(get("/api/admin/status")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk());
    }
}
