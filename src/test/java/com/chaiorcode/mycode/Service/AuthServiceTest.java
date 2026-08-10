package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.Entity.*;
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

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    private BatchRepo batchRepo;
    @Mock
    private BranchRepo branchRepo;

    @InjectMocks
    private AuthService authService;

    @Test
    void registerStudentShouldLinkDepartmentCourseBatchAndSectionByIds() {
        CreateUserDto dto = new CreateUserDto();
        dto.setName("Aman");
        dto.setEmail("aman@example.com");
        dto.setPassword("secret");
        dto.setDepartmentId(1L);
        dto.setCourseId(2L);
        dto.setBatchId(3L);
        dto.setSectionId(4L);

        Department department = new Department();
        department.setId(1L);
        Course course = new Course();
        course.setId(2L);
        course.setDuration(4);
        Batch batch = new Batch();
        batch.setId(3L);
        Section section = new Section();
        section.setId(4L);
        section.setBatch(batch);

        when(passwordEncoder.encode("secret")).thenReturn("encoded");
        when(userRepo.save(any(User.class))).thenAnswer(invocation -> {
            User user = invocation.getArgument(0);
            user.setId(10L);
            return user;
        });
        when(departmentRepository.findById(1L)).thenReturn(Optional.of(department));
        when(courseRepository.findById(2L)).thenReturn(Optional.of(course));
        when(batchRepo.findById(3L)).thenReturn(Optional.of(batch));
        when(sectionRepository.findById(4L)).thenReturn(Optional.of(section));
        when(studentRepository.save(any(Student.class))).thenAnswer(invocation -> invocation.getArgument(0));

        RegisterDTO result = authService.registerStudent(dto);

        assertNotNull(result);
        assertEquals("Aman", result.getName());
        assertEquals(Role.STUDENTS, result.getRole());

        verify(studentRepository).save(any(Student.class));
    }
}
