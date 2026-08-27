package com.northstar.crm.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtFilter) {
        this.jwtFilter = jwtFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                .cors(Customizer.withDefaults()) // honour CorsConfig for secured routes + preflight
                .csrf(csrf -> csrf.disable()) // REST API → CSRF OFF
                .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
                )
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/error").permitAll()
                        // Login is the one open door — it is how a caller gets a token.
                        .requestMatchers(HttpMethod.POST, "/api/auth/login").permitAll()
                        // Covers POST /api/v1/customers, GET/PATCH /api/v1/customers/{id}/**
                        // — also covers GET /api/v1/customers/{id}/interactions (InteractionController's
                        // timeline endpoint is nested under this path, so no separate rule is needed).
                        .requestMatchers("/api/v1/customers/**").hasAuthority("MANAGER")
                        // Covers POST /api/v1/interactions (InteractionController.create)
                        .requestMatchers("/api/v1/interactions", "/api/v1/interactions/**").hasAuthority("MANAGER")
                        .anyRequest().denyAll() // deny-by-default
                )
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
