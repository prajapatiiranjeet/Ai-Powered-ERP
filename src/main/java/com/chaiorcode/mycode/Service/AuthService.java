package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.LoginDTO;
import com.chaiorcode.mycode.DTO.LoginResponceDTO;
import com.chaiorcode.mycode.DTO.RegisterDTO;
import com.chaiorcode.mycode.Entity.*;
import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.Repo.*;
import com.chaiorcode.mycode.security.JwtService;
import jakarta.transaction.Transactional;
import lombok.AllArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Objects;
import java.util.Random;

@Service
@AllArgsConstructor
public class AuthService {

    private final PasswordEncoder passwordEncoder;
    private final UserRepo userRepo;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final CustomUserDetailsService customUserDetailsService;
    private final StudentRepository studentRepository;
    private final FacultyRepo facultyRepo;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final SectionService sectionService;
    private final BatchService batchService;
    private final BatchRepo batchRepo;
    private final BranchRepo branchRepo;




    // ye Users create krne ke liye hai
    // *******************************************************************************************************************************
    // yaha se Admin create hoga
    public RegisterDTO registerAdmin(CreateUserDto createUserDto) {
        // Yaha naya User object banaya ja raha hai jo DB me save hoga.
        // Controller se jo data aata hai (name/email/password), usko entity me set kar
        // rahe hai.
        User user = new User();
        user.setEmail(createUserDto.getEmail());
        user.setName(createUserDto.getName());
        user.setCreatedAt(createUserDto.getCreatedAt());
        // Password ko plain text me store karna dangerous hota hai.
        // Isliye PasswordEncoder (BCrypt) se encode karke hi DB me save kar rahe hai.
        user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
        // Role client ke input pe depend nahi kar raha. Admin register endpoint ka
        // matlab hi ADMIN user create karna hai.
        user.setRole(Role.ADMIN);

        User saved = userRepo.save(user);

        // in teeno cheezo ko bhejne ke liye "RegisterDTO" bnaya hai wo in teeno return
        // kri huyi cheezo ko carry krega or jaha bhena hai waha bhejega
        return new RegisterDTO(saved.getId(), saved.getName(), saved.getRole());
    }

    // *******************************************************************************************************
    // yaha se student create hoga



        @Transactional
        public RegisterDTO registerStudent(CreateUserDto createUserDto) {
            Random random = new Random();
            long randomSuffix = (long) (random.nextDouble() * 1_000_000_000L);
            String phoneNumber = String.format("9%09d", randomSuffix);

            // --- Required lookups for auto batch/section logic ---
            Department department = departmentRepository.findById(createUserDto.getDepartmentId())
                    .orElseThrow(() -> new RuntimeException("Invalid departmentId"));
            Course course = courseRepository.findById(createUserDto.getCourseId())
                    .orElseThrow(() -> new RuntimeException("Invalid courseId"));
            Branch branch = branchRepo.findById(createUserDto.getBranchId())
                    .orElseThrow(() -> new RuntimeException(
                            "Invalid branchId: " + createUserDto.getBranchId() + " — no such branch exists"));

            // --- Auto resolve or create Batch ---
            Batch batch = batchService.resolveOrCreateBatch(department, course, branch);

            // --- Auto assign Section (60 capacity, overflow -> new section) ---
            Section section = sectionService.assignSection(batch);

            // --- Create User ---
            User user = new User();
            user.setEmail(createUserDto.getEmail());
            user.setName(createUserDto.getName());
            user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
            user.setRole(Role.STUDENTS);
            user.setDepartment(department);
            user.setCourse(course);
            user.setBatch(batch);
            user.setSection(section);

            User saved = userRepo.save(user);

            // --- Create Student ---
            Student student = new Student();
            student.setRollNo("NIU-" + saved.getId());
            student.setFirstName(saved.getName());
            student.setLastName("");
            student.setEmail(saved.getEmail());
            student.setSemester(1);
            student.setPhone(phoneNumber);
            student.setAddress("Not Provided");
            student.setUser(saved);
            student.setDepartment(department);
            student.setCourse(course);
            student.setBranch(branch);
            student.setBatch(batch);
            student.setSection(section);

            studentRepository.save(student);

            return new RegisterDTO(saved.getId(), saved.getName(), saved.getRole());
        }


    // *******************************************************************************************************************************************
    // yaha faculty create hogi

    @Transactional
    public RegisterDTO registerFaculty(CreateUserDto createUserDto) {

        Random random = new Random();
        long randomSuffix = (long) (random.nextDouble() * 1_000_000_000L);
        String phoneNumber = String.format("9%09d", randomSuffix);


        Department department = departmentRepository.findById(createUserDto.getDepartmentId())
                .orElseThrow(() -> new RuntimeException("Invalid departmentId"));
        Course course = courseRepository.findById(createUserDto.getCourseId())
            .orElseThrow(() -> new RuntimeException("Invalid courseId"));
        Branch branch = branchRepo.findById(createUserDto.getBranchId())
            .orElseThrow(() -> new RuntimeException("Invalid branchId"));
        User user = new User();
        user.setEmail(createUserDto.getEmail());
        user.setName(createUserDto.getName());
        user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
        user.setDepartment(department);
        user.setCourse(course);
        user.setRole(Role.FACULTY);
        User saved = userRepo.save(user);

        Faculty faculty = new Faculty();
        faculty.setEmployeeId("NIU-EMP-" + saved.getId());
        faculty.setGender(createUserDto.getGender());
        faculty.setFirstName(saved.getName());
        faculty.setEmail(saved.getEmail());
        faculty.setDepartment(department);
        faculty.setCourse(course);
        faculty.setBranch(branch);
        faculty.setDesignation(createUserDto.getDesignation());
        faculty.setSpecialization("Not Provided");
        faculty.setJoiningDate(LocalDate.now());
        faculty.setHighestQualification("Not Provided");
        faculty.setPhone(phoneNumber);
        faculty.setAddress("Not Provided");
        faculty.setUser(saved);

        // Optional Department link from CreateUserDto


        facultyRepo.save(faculty);
        return new RegisterDTO(saved.getId(), saved.getName(), saved.getRole());
    }

    public String changepassword(CreateUserDto createUserDto) {

        String email = createUserDto.getEmail();
        User user = userRepo.findByEmail(email).orElseThrow();
        String name = user.getName();

        user.setPassword(passwordEncoder.encode(createUserDto.getPassword()));
        userRepo.save(user);
        return name + " : your password is updated";

    }

    // ***************************************************************************************************************************************************************************************
    // yaha se login hoga jwt token se
    public LoginResponceDTO login(LoginDTO loginDTO) {

        // Yaha Spring Security ka AuthenticationManager username/password validate
        // karta hai.
        // Flow:
        // 1) AuthenticationManager -> UserDetailsService ko call karta hai
        // (CustomUserDetailsService)
        // 2) UserDetailsService DB se user nikalta hai
        // 3) PasswordEncoder se password match hota hai
        // 4) Sab sahi hua to Authentication object return hota hai (authenticated =
        // true)
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginDTO.getEmail(), loginDTO.getPassword())

        );
        // authentication.getName() generally username return karta hai (hamare case me
        // email).
        String email = authentication.getName();
        // Yaha DB se user fetch kar rahe hai taaki response me id bhej sake.
        // (Authentication principal me bhi info ho sakti hai, but yaha simple approach
        // use kiya gaya hai.)
        User user = userRepo.findByEmail(email).orElseThrow();

        Long id = user.getId();

        // JWT token generate kar rahe hai.
        // JWT me subject (sub) = user email set hota hai, aur token sign hota hai
        // secret key se.
        // Ye token client ko milega aur next requests me Authorization header me Bearer
        // token ke form me aayega.
        String jwtToken = jwtService
                .generatJwttoken((UserDetails) Objects.requireNonNull(authentication.getPrincipal()));
        System.out.println(jwtToken);
        return new LoginResponceDTO(id, jwtToken);

    }





}
