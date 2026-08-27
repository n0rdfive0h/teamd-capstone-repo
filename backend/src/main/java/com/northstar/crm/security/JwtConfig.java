package com.northstar.crm.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.jwk.JWKSet;
import com.nimbusds.jose.jwk.KeyUse;
import com.nimbusds.jose.jwk.OctetSequenceKey;
import com.nimbusds.jose.jwk.source.ImmutableJWKSet;
import java.nio.charset.StandardCharsets;
import javax.crypto.spec.SecretKeySpec;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;

/**
 * HS256 signing material for the app's own login tokens, shared by {@link JwtService}
 * (minting at login) and {@link JwtAuthenticationFilter} (validation per request).
 *
 * <p>Kept separate from {@code SecurityConfig} so the decoder bean does not sit in the
 * same class the security filter chain depends on (that would be a construction cycle).
 *
 * <p>Override {@code crm.jwt.secret} in every real environment via a k8s secret; the
 * default is a dev-only placeholder and must stay at least 32 bytes for HS256.
 */
@Configuration
public class JwtConfig {

    static final String DEFAULT_DEV_SECRET = "dev-only-insecure-jwt-secret-change-me-in-prod";

    private final SecretKeySpec key;

    public JwtConfig(@Value("${crm.jwt.secret:" + DEFAULT_DEV_SECRET + "}") String secret) {
        this.key = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
    }

    @Bean
    public JwtEncoder jwtEncoder() {
        OctetSequenceKey jwk = new OctetSequenceKey.Builder(key.getEncoded())
                .keyUse(KeyUse.SIGNATURE)
                .algorithm(JWSAlgorithm.HS256)
                .build();
        return new NimbusJwtEncoder(new ImmutableJWKSet<>(new JWKSet(jwk)));
    }

    @Bean
    public JwtDecoder jwtDecoder() {
        return NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
    }
}
