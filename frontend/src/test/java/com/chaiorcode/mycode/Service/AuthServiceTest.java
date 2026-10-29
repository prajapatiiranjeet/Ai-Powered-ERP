package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.RegisterDTO;
import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.Repo.*;
import com.chaiorcode.mycode.security.JwtService;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class AuthServiceTest {

    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserRepo userRepo;
    @Mock
    private AuthenticationManager authenticationManager;
    @Mock
    private JwtService jwtService;
    @Mock
    private CustomUserDetailsService customUserDetailsService;
    @Mock
    private StudentRepository studentRepository;
    @Mock
    private FacultyRepo facultyRepo;
    @Mock
    private DepartmentRepository departmentRepository;
    @Mock
    private CourseRepository courseRepository;
    @Mock
    private SectionRepository sectionRepository;
    @Mock
    private SectionService sectionService;
    @Mock
    private BatchService batchService;
    @Mock
    private BatchRepo batchRepo;
    @Mock
    private BranchRepo branchRepo;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerAdminShouldReturnRegisterDTO() {
        CreateUserDto dto = new CreateUserDto();
        dto.setName("Admin User");
        dto.setEmail("admin@example.com");
        dto.setPassword("secret");

        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(1L);
            return user;
        });

        RegisterDTO result = authService.registerAdmin(dto);

        assertNotNull(result);
        assertEquals("Admin User", result.getName());
        assertEquals(Role.ADMIN, result.getRole());
    }
}
