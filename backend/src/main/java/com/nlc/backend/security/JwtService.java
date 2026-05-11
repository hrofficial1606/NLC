package com.nlc.backend.security;

import com.nlc.backend.config.AppProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import java.security.Key;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Map;
import java.util.function.Function;
import org.springframework.stereotype.Service;

@Service
public class JwtService {

    private final AppProperties appProperties;

    public JwtService(AppProperties appProperties) {
        this.appProperties = appProperties;
    }

    public String generateAccessToken(UserPrincipal principal) {
        LocalDateTime expiry = LocalDateTime.now()
                .plusMinutes(appProperties.getSecurity().getJwt().getAccessTokenExpirationMinutes());
        return buildToken(principal, expiry, getAccessSigningKey());
    }

    public String generateRefreshToken(UserPrincipal principal) {
        LocalDateTime expiry = LocalDateTime.now()
                .plusDays(appProperties.getSecurity().getJwt().getRefreshTokenExpirationDays());
        return buildToken(principal, expiry, getRefreshSigningKey());
    }

    public LocalDateTime getAccessTokenExpiry() {
        return LocalDateTime.now().plusMinutes(appProperties.getSecurity().getJwt().getAccessTokenExpirationMinutes());
    }

    public String extractUsername(String token) {
        return extractClaim(token, Claims::getSubject, getAccessSigningKey());
    }

    public String extractRefreshUsername(String token) {
        return extractClaim(token, Claims::getSubject, getRefreshSigningKey());
    }

    public boolean isAccessTokenValid(String token, UserPrincipal principal) {
        return principal.getUsername().equals(extractUsername(token)) && !isTokenExpired(token, getAccessSigningKey());
    }

    public boolean isRefreshTokenValid(String token, UserPrincipal principal) {
        return principal.getUsername().equals(extractRefreshUsername(token)) && !isTokenExpired(token, getRefreshSigningKey());
    }

    private String buildToken(UserPrincipal principal, LocalDateTime expiresAt, Key key) {
        return Jwts.builder()
                .claims(Map.of("userId", principal.getId(), "roles", principal.getAuthorities()))
                .subject(principal.getUsername())
                .issuer(appProperties.getSecurity().getJwt().getIssuer())
                .issuedAt(new Date())
                .expiration(Date.from(expiresAt.atZone(ZoneId.systemDefault()).toInstant()))
                .signWith(key)
                .compact();
    }

    private <T> T extractClaim(String token, Function<Claims, T> resolver, Key key) {
        Claims claims = Jwts.parser().verifyWith((javax.crypto.SecretKey) key).build()
                .parseSignedClaims(token).getPayload();
        return resolver.apply(claims);
    }

    private boolean isTokenExpired(String token, Key key) {
        Date expiration = extractClaim(token, Claims::getExpiration, key);
        return expiration.before(new Date());
    }

    private Key getAccessSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(appProperties.getSecurity().getJwt().getAccessTokenSecret().getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }

    private Key getRefreshSigningKey() {
        byte[] keyBytes = Decoders.BASE64.decode(
                java.util.Base64.getEncoder().encodeToString(appProperties.getSecurity().getJwt().getRefreshTokenSecret().getBytes())
        );
        return Keys.hmacShaKeyFor(keyBytes);
    }
}
