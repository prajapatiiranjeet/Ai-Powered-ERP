    package com.chaiorcode.mycode.Controller;

    import com.chaiorcode.mycode.DTO.*;
    import com.chaiorcode.mycode.Entity.Faculty;
    import com.chaiorcode.mycode.Entity.Student;
    import com.chaiorcode.mycode.Service.*;
    import lombok.RequiredArgsConstructor;
    import org.springframework.http.HttpStatus;
    import org.springframework.http.ResponseEntity;
    import org.springframework.security.core.Authentication;
    import org.springframework.web.bind.annotation.*;

    import java.util.List;


    @RestController
    @RequestMapping("/admin")
    @RequiredArgsConstructor
    public class AdminController {
        private final StudentService studentService;
        private final FacultyService facultyService;
        private  final AuthService authService;
        private final DepartmentService departmentService;
        private CourseService courseService;
        // NOTE:
        // Abhi yaha @RestController/@RequestMapping nahi hai, isliye runtime pe koi endpoints expose nahi hote.
        // Future me agar admin specific APIs add karni ho to is class ko RestController bana ke mappings add ki ja sakti hai.
        @PostMapping("/register-admin")
        public ResponseEntity<RegisterDTO> registeradmin(@RequestBody CreateUserDto createUserDto){
            // Faculty register endpoint: role FACULTY set hoga.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerAdmin(createUserDto));
        }


        @PostMapping("/register-faculty")
        public ResponseEntity<RegisterDTO> registerfaculty(@RequestBody CreateUserDto createUserDto){
            // Faculty register endpoint: role FACULTY set hoga.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerFaculty(createUserDto));
        }



        @PostMapping("/register-student")
        public ResponseEntity<RegisterDTO> registerstudent(@RequestBody CreateUserDto createUserDto){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(authService.registerStudent(createUserDto));
        }

        @PutMapping("/student-update")
        public ResponseEntity<Student> updateStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {

            String email = authentication.getName();
            return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudent(email , studentDTO));
        }

        @PutMapping("/change-password")
        public ResponseEntity<String> updateStudentpassword(@RequestBody CreateUserDto createUserDto) {


            return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
        }


        @GetMapping("/get-all-students")
        public List<String> getallStudent(){
            return studentService.Studentgetall();
        }

        @DeleteMapping("/student-delete")
        public ResponseEntity<String> deleteStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {
            String email = studentDTO.getEmail();
            return ResponseEntity.status(HttpStatus.OK).body(studentService.deleteStudent(email));
        }

//        @GetMapping("/get-all-faculty")
//        public List<String> getallFaculty(){
//            return facultyService.Facultygetall();
//        }



        @PostMapping("/update_department")
        public ResponseEntity<String> registerstudent(@RequestBody DepartmentDTO dto){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(departmentService.setdepartment(dto));
        }

        @PostMapping("/insert-course")
        public ResponseEntity<String> insertcourse(@RequestBody CoursDTO coursDTO){
            // Student register ke liye same DTO use ho raha hai, but service me role STUDENTS force hota hai.
            return ResponseEntity.status(HttpStatus.OK
            ).body(courseService.insertcourse(coursDTO));
        }
    }











