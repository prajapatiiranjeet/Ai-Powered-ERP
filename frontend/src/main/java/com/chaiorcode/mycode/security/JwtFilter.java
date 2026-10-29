package com.chaiorcode.mycode.security;

import com.chaiorcode.mycode.Service.CustomUserDetailsService;
import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
@RequiredArgsConstructor
public class JwtFilter extends OncePerRequestFilter {
    // JwtFilter ka kaam:
    // Har incoming request me Authorization header check karna,
    // JWT token verify karna,
    // aur valid user ka Authentication SecurityContextHolder me set karna.
    // OncePerRequestFilter ensure karta hai ki ye filter per request sirf ek baar run ho.
    private final CustomUserDetailsService customUserDetailsService;
    private final JwtService jwtService;
    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain)
            throws ServletException, IOException {


        String Header = request.getHeader("Authorization");
        if (Header != null && Header.startsWith("Bearer ")) {


            // TODO: Extract username from token
            // String username = jwtHelper.getUsernameFromToken(token);

            // TODO: Validate token

            // TODO: Set Authentication in SecurityContextHolder
        }

        // Agar Authorization header hi nahi hai, ya Bearer token format me nahi hai,
        // to iska matlab user anonymous hai (ya open endpoint hit kar raha hai).
        // Aise case me filter JWT validation skip karke request aage bhej deta hai.
        if (Header == null || !Header.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        try {



            // Yaha request se JWT token nikal rahe hai.
            // Standard format: Authorization: Bearer <token>
            String token = Header.substring(7);
            // parseToken signature + expiration verify karta hai aur claims return karta hai.
            Claims claims = jwtService.parseToken(token);
            // Hamare JWT me subject me email store hai (JwtService.generatJwttoken me set kiya gaya).
            String email = claims.getSubject();
            // Email se DB me user load hoga, aur roles/authorities milegi.
            UserDetails user = customUserDetailsService.loadUserByUsername(email);

            // Is Authentication object ka matlab: "is request ka user authenticated hai aur iske paas ye authorities hai".
            // Password yaha null hai kyuki JWT based request me password repeat nahi hota.
            UsernamePasswordAuthenticationToken auth =
                    new UsernamePasswordAuthenticationToken(user , null , user.getAuthorities());

            // SecurityContextHolder me Authentication set karte hi,
            // Spring Security ko pata chal jata hai ki request authenticated hai.
            // Fir @PreAuthorize / hasRole / hasAnyRole jaise checks isi context ke basis pe hote hai.
            SecurityContextHolder.getContext().setAuthentication(auth);




        } catch (Exception e) {
           // Agar token invalid/expired ho, ya parsing fail ho, ya user na mile,
           // to request ko unauthorized mark karke yahi stop kar dete hai.
           response.setStatus(HttpStatus.UNAUTHORIZED.value());
           return;
        }

        // Agar JWT valid hai to request aage controller tak jayegi.
        filterChain.doFilter(request, response);
    }
}
