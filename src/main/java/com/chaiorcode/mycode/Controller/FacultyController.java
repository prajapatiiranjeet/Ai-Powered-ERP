package com.chaiorcode.mycode.Controller;


import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.FacultyProfileDTO;
import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Service.AuthService;
import com.chaiorcode.mycode.Service.FacultyService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/faculty")
@RequiredArgsConstructor
public class FacultyController {


       private  final AuthService authService;
    // NOTE:
    // Abhi is controller me endpoints implement nahi kiye gaye.
    // SecurityConfig me /faculty/** route ko ADMIN + FACULTY roles ke liye allowed rakha hai,
    // so future me jo bhi APIs yaha add hongi wo JWT + role checks se secure rahengi.
    private final FacultyService facultyService;

    @GetMapping("/view-profile")
    public ResponseEntity<FacultyProfileDTO> viewProfile(Authentication authentication) {
        return ResponseEntity.ok(facultyService.viewProfile(authentication.getName()));
    }

    @PutMapping("/faculty-update")
    public ResponseEntity<Faculty> updatefaculty(@RequestBody FacultyRequestDTO facultyDTO, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.OK).body(facultyService.updatefaculty(email , facultyDTO));
    }

    @PutMapping("/faculty-change-password")
    public ResponseEntity<String> updateFacultypassword(@RequestBody CreateUserDto createUserDto) {


        return ResponseEntity.status(HttpStatus.OK).body(authService.changepassword(createUserDto));
    }
}
