package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Repo.UserRepo;
import lombok.AllArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
@AllArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepo userRepo;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {

        // Spring Security ka authentication flow yaha aake DB se user details nikalta hai.
        // login time pe bhi, aur JWT filter time pe bhi, same email/username se user load hota hai.
        User user = userRepo.findByEmail(email)
                .orElseThrow(()-> new UsernameNotFoundException("User not found with email :" +  email));

        // Yaha ham apne Entity User ko Spring Security ke UserDetails me convert kar rahe hai.
        // .roles(...) internally ROLE_ prefix add karta hai, so example: ADMIN => ROLE_ADMIN.
        // Ye authorities aage authorization rules (hasRole/hasAnyRole) me use hoti hai.
        return org.springframework.security.core.userdetails.User.builder()
                .username(user.getEmail())
                .password(user.getPassword())
                .roles(normalizeRole(user.getRole()))
                .build();
    }

    private String normalizeRole(Role role) {
        if (role == null) {
            return "USER";
        }

        if (role == Role.STUDENT || role == Role.STUDENTS) {
            return "STUDENTS";
        }

        return role.name();
    }
}
