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

@Configuration
@AllArgsConstructor
public class websecurityconfig {
    private final JwtFilter jwtFilter;

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
                .csrf(csrf -> csrf.disable())
                // JWT based APIs me generally session maintain nahi karte.
                // Har request me token aata hai, filter usko validate karta hai aur SecurityContext me Authentication set karta hai.
                // Isliye SessionCreationPolicy.STATELESS rakha hai.
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // /auth/** endpoints open hai kyuki yahi se register/login hota hai, aur yahi se JWT milta hai.
                        .requestMatchers("/auth/**" ).permitAll()
                        .requestMatchers(HttpMethod.POST,
                                "/admin/register-admin",
                                "/admin/register-faculty",
                                "/admin/register-student",
                                "/admin/update_department",
                                "/admin/insert-course").permitAll()
                        // hasAnyRole internally ROLE_ prefix lagata hai.
                        // Example: hasAnyRole("ADMIN") => authority "ROLE_ADMIN" check hoti hai.
                        // NOTE: Yaha "STUDENT" / "FACULTY" strings role ke naam se match hone chahiye jo UserDetailsService set karta hai.
                        .requestMatchers("/admin/**").hasRole("ADMIN")
                        .requestMatchers("/students/**").hasAnyRole("ADMIN", "STUDENTS")
                        .requestMatchers("/faculty/**").hasAnyRole("ADMIN", "FACULTY")
                        .anyRequest().authenticated())
                // JwtFilter ko UsernamePasswordAuthenticationFilter se pehle run kara rahe hai.
                // Reason: Hame request aate hi JWT parse karke SecurityContext set karna hai,
                // taaki controller/service ke time pe current user/roles available ho.
                .addFilterBefore(jwtFilter , UsernamePasswordAuthenticationFilter.class);

//                .httpBasic(Customizer.withDefaults()); ise remove krdiya hai kyuki ab ham JWT tokens use krenge or Based authentication use nhi krenge

        return http.build();
    }


//    @Bean
//    public UserDetailsService userDetailsService() {
//
//        UserDetails student = User.builder()
//                .username("student")
//                .password(passwordEncoder().encode("student123"))
//                .roles("STUDENT")
//                .build();
//
//
//        UserDetails faculty = User.builder()
//                .username("faculty")
//                .password(passwordEncoder().encode("faculty123"))
//                .roles("FACULTY")
//                .build();
//
//
//        UserDetails admin = User.builder()
//                .username("admin")
//                .password(passwordEncoder().encode("admin123"))
//                .roles("ADMIN")
//                .build();
//
//
//        return new InMemoryUserDetailsManager(
//                student,
//                faculty,
//                admin
//        );
//    }    temperory users bnaye the roles ke sath


    @Bean
    public PasswordEncoder passwordEncoder() {
        // BCrypt industry-standard hashing algorithm hai.
        // Password DB me kabhi plain text me store nahi karna chahiye.
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration){
                // AuthenticationManager Spring Security ka main entry point hai username/password authentication ke liye.
                // Isko manually create nahi kar rahe, existing AuthenticationConfiguration se le rahe hai.
                return authenticationConfiguration.getAuthenticationManager();
    }

}
