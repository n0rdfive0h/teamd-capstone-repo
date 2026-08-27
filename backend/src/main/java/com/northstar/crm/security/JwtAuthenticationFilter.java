package com.northstar.crm.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.Collection;
import java.util.List;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Authenticates a request from an {@code Authorization: Bearer <jwt>} header.
 *
 * <p>The token is verified against the shared HS256 secret ({@code crm.jwt.secret}).
 * Its {@code sub} becomes the principal and its {@code authorities} claim becomes the
 * granted authorities (each also exposed as a {@code ROLE_}-prefixed authority so both
 * {@code hasAuthority("MANAGER")} and {@code hasRole("MANAGER")} checks pass).
 *
 * <p>A missing, malformed, or expired token leaves the request anonymous — deny-by-default
 * in {@link SecurityConfig} then turns that into a 401.
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final String BEARER_PREFIX = "Bearer ";

    private final JwtDecoder jwtDecoder;

    public JwtAuthenticationFilter(JwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authHeader = request.getHeader("Authorization");

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length());
            try {
                Jwt jwt = jwtDecoder.decode(token);
                var authentication = new UsernamePasswordAuthenticationToken(
                        jwt.getSubject(), null, authorities(jwt));
                authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authentication);
            } catch (JwtException ex) {
                // Invalid/expired token — stay anonymous; the entry point returns 401.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }

    private static Collection<GrantedAuthority> authorities(Jwt jwt) {
        List<String> claim = jwt.getClaimAsStringList(JwtService.AUTHORITIES_CLAIM);
        Collection<GrantedAuthority> authorities = new ArrayList<>();
        if (claim != null) {
            for (String authority : claim) {
                authorities.add(new SimpleGrantedAuthority(authority));
                authorities.add(new SimpleGrantedAuthority("ROLE_" + authority));
            }
        }
        return authorities;
    }
}
