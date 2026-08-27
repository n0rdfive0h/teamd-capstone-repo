package com.northstar.crm.service;

import com.northstar.crm.domain.exception.InvalidCredentialsException;
import com.northstar.crm.security.JwtService;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    // The only user fixture right now. The password is a hardcoded placeholder
    // until a real user store / identity provider lands (ADR-004).
    private static final String FIXTURE_USERNAME = "agent1";
    private static final String FIXTURE_PASSWORD = "password";

    private final JwtService jwtService;

    public AuthService(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    /**
     * Validate credentials and return a freshly signed JWT.
     *
     * @throws InvalidCredentialsException if the username/password pair is not the fixture
     */
    public String login(String username, String password) {
        if (!FIXTURE_USERNAME.equals(username) || !FIXTURE_PASSWORD.equals(password)) {
            throw new InvalidCredentialsException();
        }
        return jwtService.issue(username);
    }
}
