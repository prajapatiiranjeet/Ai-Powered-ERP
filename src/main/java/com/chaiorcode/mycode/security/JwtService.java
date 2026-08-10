package com.chaiorcode.mycode.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Service
public class JwtService {

    @Value("${jwt.secret}")
    private String jwtsecret;

    private SecretKey getKey() {
        // Secret key ko bytes me convert karke HMAC key banate hai.
        // JWT ki signature verify/produce karne ke liye same secret key use hoti hai.
        return Keys.hmacShaKeyFor(jwtsecret.getBytes(StandardCharsets.UTF_8));
    }


    public String generatJwttoken(UserDetails userDetails){
            // JWT me subject (sub) ko username/email rakh rahe hai.
            // issuedAt: token kab generate hua
            // expiration: token kab expire hoga (yaha 15 minutes)
            // signWith: token ko secret key se sign kar rahe hai taaki tampering detect ho sake.
            return Jwts.builder().subject(userDetails.getUsername())
                    .issuedAt(new Date())
                    .expiration(new Date(System.currentTimeMillis() + 1000 * 60 *40))
                    .signWith(getKey())
                    .compact();


    }

    public Claims parseToken(String token) {
        // parseToken ka kaam:
        // 1) signature verify karna (verifyWith(getKey()))
        // 2) token ko parse karke claims nikalna (subject, expiration, etc.)
        // Agar token invalid/expire hua to yaha exception throw hota hai.
        return Jwts.parser().verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
