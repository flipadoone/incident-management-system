package com.viaappia.incident.security.jwt;

import com.viaappia.incident.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Date;

/**
 * Service responsible for generating and validating JWT tokens.
 */
@Service
public class JwtService {

    private static final String SECRET_KEY =
            "viaappia-incident-management-system-secret-key-minimum-32-characters";

    private static final long EXPIRATION_IN_MILLISECONDS = 1000L * 60 * 60 * 8;

    /**
     * Generates a JWT token for an authenticated user.
     *
     * @param user authenticated user
     * @return signed JWT token
     */
    public String generateToken(User user) {
        Instant now = Instant.now();

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("userId", user.getId().toString())
                .claim("name", user.getName())
                .claim(
                        "roles",
                        user.getRoles()
                                .stream()
                                .map(role -> role.getName().name())
                                .toList()
                )
                .issuedAt(Date.from(now))
                .expiration(Date.from(now.plusMillis(EXPIRATION_IN_MILLISECONDS)))
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extracts username/email from token.
     *
     * @param token JWT token
     * @return user email
     */
    public String extractUsername(String token) {
        return extractAllClaims(token).getSubject();
    }

    /**
     * Validates whether the token belongs to the given user and is not expired.
     *
     * @param token JWT token
     * @param username expected username/email
     * @return true when token is valid
     */
    public boolean isTokenValid(String token, String username) {
        String extractedUsername = extractUsername(token);
        return extractedUsername.equals(username) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractAllClaims(token)
                .getExpiration()
                .before(new Date());
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(getSigningKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private SecretKey getSigningKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes(StandardCharsets.UTF_8));
    }
}