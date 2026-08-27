package com.northstar.crm.service;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import com.northstar.crm.domain.exception.InvalidCredentialsException;
import com.northstar.crm.security.JwtService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;

class AuthServiceTest {

    private final JwtService jwtService = Mockito.mock(JwtService.class);
    private final AuthService authService = new AuthService(jwtService);

    @Test
    void login_withFixtureCredentials_returnsIssuedToken() {
        when(jwtService.issue("agent1")).thenReturn("signed.jwt.value");

        assertThat(authService.login("agent1", "password")).isEqualTo("signed.jwt.value");
        verify(jwtService).issue("agent1");
    }

    @Test
    void login_withWrongPassword_throwsAndIssuesNothing() {
        assertThatThrownBy(() -> authService.login("agent1", "wrong"))
                .isInstanceOf(InvalidCredentialsException.class);
        verifyNoInteractions(jwtService);
    }

    @Test
    void login_withUnknownUsername_throws() {
        assertThatThrownBy(() -> authService.login("intruder", "password"))
                .isInstanceOf(InvalidCredentialsException.class);
    }
}
