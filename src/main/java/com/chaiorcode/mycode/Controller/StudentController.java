package com.chaiorcode.mycode.Controller;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Service.AuthService;
import com.chaiorcode.mycode.Service.CustomUserDetailsService;
import com.chaiorcode.mycode.Service.StudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private  final AuthService authService;
    // NOTE:
    // Abhi is controller me endpoints implement nahi kiye gaye.
    // SecurityConfig me /students/** route ko ADMIN + STUDENT roles ke liye allowed rakha hai,
    // so future me jab bhi yaha APIs add hongi, ye already role-based protected rahengi.
    @PutMapping("/update")
    public ResponseEntity<Student> updateStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudent(email , studentDTO));
    }


    @PutMapping("/student-change-password")
    public ResponseEntity<String> updateStudentstudent(@RequestBody CreateUserDto createUserDto) {


        return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
    }

    @GetMapping("view-profile")
    public ResponseEntity<?> viewprofile(Authentication authentication){
        String email = authentication.getName();
        CreateUserDto studentDTO = studentService.viewprofilebyEmail(email);
        return ResponseEntity.ok(studentDTO);
    }
}
