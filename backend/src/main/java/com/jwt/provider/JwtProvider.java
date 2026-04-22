package com.jwt.provider;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@Slf4j
@Component
public class JwtProvider {

    @Value("${jwt.secret}")
    private String jwtSecret;

    @Value("${jwt.expiration.access}")
    private long accessTokenExpiration;

    @Value("${jwt.expiration.refresh}")
    private long refreshTokenExpiration;

    private static final String TOKEN_TYPE = "Bearer";

    /**
     * Genera un JWT access token
     */
    public String generateAccessToken(Long userId, String username, String email) {
        return generateToken(userId, username, email, accessTokenExpiration);
    }

    /**
     * Genera un JWT refresh token
     */
    public String generateRefreshToken(Long userId, String username, String email) {
        return generateToken(userId, username, email, refreshTokenExpiration);
    }

    /**
     * Genera un JWT con claims personalizados
     */
    private String generateToken(Long userId, String username, String email, long expirationTime) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        claims.put("username", username);
        claims.put("email", email);

        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationTime);

        return Jwts.builder()
                .claims(claims)
                .subject(username)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(getSigningKey())
                .compact();
    }

    /**
     * Extrae el username del JWT
     */
    public String extractUsername(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getSubject();
        } catch (JwtException e) {
            log.warn("Error extrayendo username del token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrae el userId del JWT
     */
    public Long extractUserId(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("userId", Long.class);
        } catch (JwtException e) {
            log.warn("Error extrayendo userId del token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrae el email del JWT
     */
    public String extractEmail(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .get("email", String.class);
        } catch (JwtException e) {
            log.warn("Error extrayendo email del token: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Extrae la fecha de expiración del JWT
     */
    public Date extractExpiration(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token)
                    .getPayload()
                    .getExpiration();
        } catch (JwtException e) {
            log.warn("Error extrayendo fecha de expiración: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Valida si el JWT es válido y no ha expirado
     */
    public boolean validateToken(String token) {
        try {
            Jwts.parser()
                    .verifyWith(getSigningKey())
                    .build()
                    .parseSignedClaims(token);
            return true;
        } catch (SecurityException e) {
            log.warn("JWT signature no válida: {}", e.getMessage());
        } catch (MalformedJwtException e) {
            log.warn("JWT token inválido: {}", e.getMessage());
        } catch (ExpiredJwtException e) {
            log.warn("JWT token expirado: {}", e.getMessage());
        } catch (UnsupportedJwtException e) {
            log.warn("JWT token no soportado: {}", e.getMessage());
        } catch (IllegalArgumentException e) {
            log.warn("JWT claims vacío: {}", e.getMessage());
        }
        return false;
    }

    /**
     * Obtiene la clave secreta para firmar el JWT
     */
    private SecretKey getSigningKey() {
        byte[] keyBytes = jwtSecret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    /**
     * Retorna el tiempo de expiración del access token
     */
    public long getAccessTokenExpiration() {
        return accessTokenExpiration;
    }

    /**
     * Retorna el tipo de token (Bearer)
     */
    public String getTokenType() {
        return TOKEN_TYPE;
    }

}
