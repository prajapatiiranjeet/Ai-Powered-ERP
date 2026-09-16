package com.chaiorcode.mycode.Controller;

import com.chaiorcode.mycode.DTO.StudentAttendanceReportDTO;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.DTO.StudentProfileDTO;
import com.chaiorcode.mycode.DTO.StudentPasswordChangeRequest;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Service.*;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;


@RestController
@RequestMapping("/students")
@RequiredArgsConstructor
public class StudentController {

    private final StudentService studentService;
    private  final AuthService authService;
    private final SherpalService sherpalService;
    private final AttendanceService attendanceService;



    @PostMapping("/ask-to-sherpal")
    public ResponseEntity<String> ask(@RequestBody String question, Authentication authentication) {
        String email = authentication.getName();
        StudentProfileDTO profile = studentService.viewprofilebyEmail(email);
        StudentAttendanceReportDTO attendanceReport = attendanceService.getStudentReport(email);

        DateTimeFormatter readableDateTime = DateTimeFormatter.ofPattern(
                "dd MMMM yyyy, hh:mm a", Locale.ENGLISH);

        // ✅ Phone removed — internal detail, not needed by LLM
        String userContext = """
            Full Name: %s
            Department: %s
            Course: %s
            Branch: %s
            Section: %s
            Current Date and Time: %s
            Overall Attendance: %s%%
            Subject-wise Attendance:
            %s
            """.formatted(
                profile.getFullName(),
                profile.getDepartment(),
                profile.getCourse(),
                profile.getBranch(),
                profile.getSection(),
                LocalDateTime.now().format(readableDateTime),
                attendanceReport.getPresentPercentage(),
                attendanceReport.getSubjectSummaries().stream()
                        .map(s -> "  - [%s] %s: Present %d / %d | Absent %d | Leave %d | %.1f%%"
                                .formatted(
                                        s.getSubjectCode(),
                                        s.getSubjectName(),
                                        s.getPresentCount(),
                                        s.getTotalClassHeld(),
                                        s.getAbsentCount(),
                                        s.getLeave(),
                                        s.getPercentage()))
                        .collect(Collectors.joining("\n"))
        );

          return ResponseEntity.ok(sherpalService.ask(question, "STUDENT", userContext));
    }




    @PutMapping("/update")
    public ResponseEntity<Student> updateStudent(@RequestBody StudentDTO studentDTO, Authentication authentication) {

        String email = authentication.getName();
        return ResponseEntity.status(HttpStatus.OK).body(studentService.updateStudent(email , studentDTO));
    }


    @PutMapping("/student-change-password")
    public ResponseEntity<String> updateStudentPassword(@RequestBody StudentPasswordChangeRequest request,
                                                        Authentication authentication) {
        return ResponseEntity.status(HttpStatus.OK)
                .body(authService.changeOwnPassword(authentication.getName(), request.getCurrentPassword(), request.getNewPassword()));
    }

    @GetMapping("/view-profile")
    public ResponseEntity<StudentProfileDTO> viewprofile(Authentication authentication){
        String email = authentication.getName();
        StudentProfileDTO dto = studentService.viewprofilebyEmail(email);
        return ResponseEntity.ok(dto);
    }

    // Students can read only their own subject-wise attendance summary from the JWT identity.
    @GetMapping("/attendance")
    public ResponseEntity<StudentAttendanceReportDTO> attendance(Authentication authentication) {
        return ResponseEntity.ok(attendanceService.getStudentReport(authentication.getName()));
    }
}
