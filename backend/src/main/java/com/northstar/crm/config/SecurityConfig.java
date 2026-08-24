package com.example.customermanagementplatform.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
            // REST API: no server-side sessions
            .sessionManagement(session ->
                session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            // API authorization rules
            .authorizeHttpRequests(auth -> auth
                // Kubernetes/application health checks are public
                .requestMatchers("/actuator/health/**").permitAll()

                // Everything under /api requires a valid JWT
                .requestMatchers("/api/**").authenticated()

                // Deny anything not explicitly permitted
                .anyRequest().denyAll()
            )

            // Validate Bearer JWTs
            .oauth2ResourceServer(oauth2 ->
                oauth2.jwt(jwt -> {})
            );

        return http.build();
    }
}
