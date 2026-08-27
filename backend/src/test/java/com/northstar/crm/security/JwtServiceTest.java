package com.northstar.crm.security;

import static org.assertj.core.api.Assertions.assertThat;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import org.junit.jupiter.api.Test;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

class JwtServiceTest {

    private static final String SECRET = "test-only-secret-that-is-at-least-32-bytes-long";

    private final SecretKeySpec key =
            new SecretKeySpec(SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    private final JwtService jwtService =
            new JwtService(new NimbusJwtEncoder(new ImmutableJWKSet<>(
                    new JWKSet(new OctetSequenceKey.Builder(key.getEncoded())
                            .keyUse(KeyUse.SIGNATURE)
                            .algorithm(JWSAlgorithm.HS256)
                            .build()))));
    private final JwtDecoder decoder =
            NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();

    @Test
    void issuedToken_verifiesAndCarriesSubjectAndAuthorities() {
        Jwt jwt = decoder.decode(jwtService.issue("agent1"));

        assertThat(jwt.getSubject()).isEqualTo("agent1");
        assertThat(jwt.getClaimAsString("iss")).isEqualTo(JwtService.ISSUER);
        assertThat(jwt.getClaimAsStringList(JwtService.AUTHORITIES_CLAIM)).containsExactly("MANAGER");
        assertThat(jwt.getExpiresAt()).isNotNull();
    }

    @Test
    void tokenSignedWithADifferentKey_isRejected() {
        SecretKeySpec otherKey = new SecretKeySpec(
                "a-completely-different-secret-key-32-bytes".getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        JwtDecoder otherDecoder =
                NimbusJwtDecoder.withSecretKey(otherKey).macAlgorithm(MacAlgorithm.HS256).build();

        String token = jwtService.issue("agent1");

        org.assertj.core.api.Assertions.assertThatThrownBy(() -> otherDecoder.decode(token))
                .isInstanceOf(org.springframework.security.oauth2.jwt.JwtException.class);
    }
}
