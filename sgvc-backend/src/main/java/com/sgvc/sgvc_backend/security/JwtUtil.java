package com.sgvc.sgvc_backend.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Base64;
import java.util.Date;
import java.util.List;
import java.util.function.Function;

@Component
public class JwtUtil {

    // Clé secrète lue depuis application.properties (base64).
    // Elle est FIXE : les tokens restent valides après redémarrage du serveur.
    private final SecretKey secretKey;

    private final long expirationMs;

    public JwtUtil(
            @Value("${app.jwt.secret}") String secretBase64,
            @Value("${app.jwt.expiration-ms:36000000}") long expirationMs) {
        byte[] cle = Base64.getDecoder().decode(secretBase64);
        this.secretKey = Keys.hmacShaKeyFor(cle);
        this.expirationMs = expirationMs;
    }

    // Génère un token pour un utilisateur donné, en incluant ses rôles
    public String generateToken(String email, List<String> roles) {
        return Jwts.builder()
                .subject(email)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + expirationMs))
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return extractClaim(token, Claims::getSubject);
    }

    @SuppressWarnings("unchecked")
    public List<String> extractRoles(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("roles", List.class);
    }

    public boolean isTokenValid(String token, String email) {
        String emailDuToken = extractEmail(token);
        return emailDuToken.equals(email) && !isTokenExpired(token);
    }

    private boolean isTokenExpired(String token) {
        return extractClaim(token, Claims::getExpiration).before(new Date());
    }

    private <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
