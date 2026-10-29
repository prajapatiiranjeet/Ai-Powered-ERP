package com.chaiorcode.mycode.Controller;


import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.AttendanceMarkRequest;
import com.chaiorcode.mycode.DTO.AttendanceRosterItem;
import com.chaiorcode.mycode.DTO.FacultyProfileDTO;
import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.DTO.SubjectOfferingDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Entity.SubjectOffering;
import com.chaiorcode.mycode.Repo.SubjectOfferingRepository;
import com.chaiorcode.mycode.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;
import java.time.LocalDate;
import jakarta.validation.Valid;

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

    private final SherpalService sherpalService;
    private final SubjectOfferingRepository subjectOfferingRepository;
    private final SubjectOfferingService subjectOfferingService;
    private final AttendanceService attendanceService;


    // Step 1: Faculty login karke apne offerings dekhta hai (dropdown me "Subject - Section" dikhega)
    @GetMapping("/my-subjects")
    public ResponseEntity<List<SubjectOfferingDTO>> getMyOfferings(Authentication auth) {
        String email = auth.getName();
        Long facultyid = facultyService.getfacyltyidbyemail(email);

        return ResponseEntity.ok(subjectOfferingService.getMyOfferings(facultyid));
    }

    // Returns only the selected offering's students and their saved status for this date.
    @GetMapping("/attendance/roster")
    public ResponseEntity<List<AttendanceRosterItem>> getAttendanceRoster(
            @RequestParam Long offeringId,
            @RequestParam LocalDate date,
            Authentication auth) {
        return ResponseEntity.ok(attendanceService.getRoster(auth.getName(), offeringId, date));
    }

    // Saves the complete date roster; the service performs ownership and section checks.
    @PostMapping("/attendance")
    public ResponseEntity<List<AttendanceRosterItem>> markAttendance(
            @Valid @RequestBody AttendanceMarkRequest request,
            Authentication auth) {
        return ResponseEntity.ok(attendanceService.mark(auth.getName(), request));
    }




    @PostMapping("/ask-to-sherpal")
        public ResponseEntity<String> ask(@RequestBody String question, Authentication authentication) {
        FacultyProfileDTO profile = facultyService.viewProfile(authentication.getName());
        String userContext = """
            Full Name: %s
            Employee ID: %s
            Designation: %s
            Department: %s
            Specialization: %s
            Highest Qualification: %s
            Joining Date: %s
            """.formatted(profile.getFullName(), profile.getEmployeeId(), profile.getDesignation(),
            profile.getDepartment(), profile.getSpecialization(), profile.getHighestQualification(),
            profile.getJoiningDate());

        return ResponseEntity.ok(sherpalService.ask(question, "FACULTY", userContext));
    }

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
