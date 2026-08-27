package com.northstar.crm.api;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.northstar.crm.domain.exception.InvalidCredentialsException;
import com.northstar.crm.security.JwtConfig;
import com.northstar.crm.security.SecurityConfig;
import com.northstar.crm.service.AuthService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

@WebMvcTest(AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import({SecurityConfig.class, JwtConfig.class}) // real security chain + the JWT signing beans it needs
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private AuthService authService;

    @Test
    void login_validCredentials_returns200WithToken() throws Exception {
        when(authService.login(eq("agent1"), eq("password"))).thenReturn("token-123");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {"username":"agent1","password":"password"}
                """))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("token-123"))
                .andExpect(jsonPath("$.username").value("agent1"));
    }

    @Test
    void login_wrongCredentials_returns401() throws Exception {
        when(authService.login(any(), any())).thenThrow(new InvalidCredentialsException());

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {"username":"agent1","password":"nope"}
                """))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void login_blankUsername_returns400() throws Exception {
        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                {"username":"","password":"password"}
                """))
                .andExpect(status().isBadRequest());
    }
}
