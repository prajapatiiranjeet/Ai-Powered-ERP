package com.chaiorcode.mycode.security;

import jakarta.servlet.FilterChain;
import lombok.AllArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.authentication.jaas.memory.InMemoryConfiguration;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.provisioning.InMemoryUserDetailsManager;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.List;

@Configuration
@AllArgsConstructor
public class websecurityconfig {
    private final JwtFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                        .requestMatchers("/auth/**").permitAll()
                        .requestMatchers("/admin/**").hasAnyRole("ADMIN")
                        .requestMatchers("/students/**").hasAnyRole("ADMIN", "STUDENTS")
                        .requestMatchers("/faculty/**").hasAnyRole("ADMIN", "FACULTY")
                        .anyRequest().authenticated())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOriginPatterns(List.of("*"));
        configuration.setAllowedMethods(List.of("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    // @Bean
    // public UserDetailsService userDetailsService() {
    //
    // UserDetails student = User.builder()
    // .username("student")
    // .password(passwordEncoder().encode("student123"))
    // .roles("STUDENT")
    // .build();
    //
    //
    // UserDetails faculty = User.builder()
    // .username("faculty")
    // .password(passwordEncoder().encode("faculty123"))
    // .roles("FACULTY")
    // .build();
    //
    //
    // UserDetails admin = User.builder()
    // .username("admin")
    // .password(passwordEncoder().encode("admin123"))
    // .roles("ADMIN")
    // .build();
    //
    //
    // return new InMemoryUserDetailsManager(
    // student,
    // faculty,
    // admin
    // );
    // } temperory users bnaye the roles ke sath

    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt industry-standard hashing algorithm hai.
        // Password DB me kabhi plain text me store nahi karna chahiye.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration) {
        // AuthenticationManager Spring Security ka main entry point hai
        // username/password authentication ke liye.
        // Isko manually create nahi kar rahe, existing AuthenticationConfiguration se
        // le rahe hai.
        return authenticationConfiguration.getAuthenticationManager();
    }

}
