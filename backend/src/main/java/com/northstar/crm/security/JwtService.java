package com.northstar.crm.security;

import java.time.Duration;
import java.time.Instant;
import java.util.List;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Component;

/**
 * Mints the signed JWTs handed out by {@code POST /api/auth/login}.
 *
 * <p>Tokens are HS256-signed with the shared secret configured as {@code crm.jwt.secret}
 * (see {@link SecurityConfig}). They are self-contained and stateless — validation only
 * needs the same secret, no server-side store (ADR-004).
 */
@Component
public class JwtService {

    static final String ISSUER = "crm-api";
    static final String AUTHORITIES_CLAIM = "authorities";
    private static final Duration TTL = Duration.ofHours(8);

    private final JwtEncoder jwtEncoder;

    public JwtService(JwtEncoder jwtEncoder) {
        this.jwtEncoder = jwtEncoder;
    }

    /** Issue a token for {@code username} carrying the MANAGER authority. */
    public String issue(String username) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(ISSUER)
                .issuedAt(now)
                .expiresAt(now.plus(TTL))
                .subject(username)
                .claim(AUTHORITIES_CLAIM, List.of("MANAGER"))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return jwtEncoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
