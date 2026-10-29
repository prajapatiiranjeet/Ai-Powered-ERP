package com.chaiorcode.mycode.Controller;

import com.chaiorcode.mycode.DTO.AttendanceSubjectSummaryDTO;
import com.chaiorcode.mycode.DTO.StudentAttendanceReportDTO;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.DTO.StudentProfileDTO;
import com.chaiorcode.mycode.DTO.StudentPasswordChangeRequest;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Repo.CourseSemesterBranchSubjectRepository;
import com.chaiorcode.mycode.Repo.StudentRepository;
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
    private final StudentRepository studentRepository;
    private final CourseSemesterBranchSubjectRepository courseSemesterBranchSubjectRepository;



    @PostMapping("/ask-to-sherpal")
    public ResponseEntity<String> ask(@RequestBody String question, Authentication authentication) {
        String email = authentication.getName();
        StudentProfileDTO profile = studentService.viewprofilebyEmail(email);
        StudentAttendanceReportDTO attendanceReport = attendanceService.getStudentReport(email);
        if (isSubjectAttendanceQuestion(question)) {
            return ResponseEntity.ok(formatSubjectAttendance(attendanceReport.getSubjectSummaries()));
        }

        Long courseId = studentRepository.findCourseIdByEmail(email);
        Long branchId = studentRepository.findBranchIdByEmail(email);
        Integer semester = studentRepository.findSemesterIdByEmail(email);
        String currentSemesterSubjects = courseId == null || branchId == null || semester == null
                ? "No current-semester subject catalog is available."
                : courseSemesterBranchSubjectRepository.findStudentSemesterSubjects(courseId, branchId, semester)
                        .stream()
                        .map(subject -> "- [%s] %s".formatted(subject.getSubjectCode(), subject.getSubjectName()))
                        .collect(Collectors.joining("\n"));

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
            Current Semester: %s
            Current Semester Subjects:
            %s
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
                semester == null ? "Not available" : semester,
                currentSemesterSubjects.isBlank() ? "No subjects are assigned for this semester." : currentSemesterSubjects,
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

          return ResponseEntity.ok(sherpalService.ask(question, "STUDENT", userContext, profile.getFullName()));
    }




    private boolean isSubjectAttendanceQuestion(String question) {
        String normalized = question == null ? "" : question.toLowerCase(Locale.ROOT);
        return normalized.matches("(?s).*(?=.*\\battend[a-z]*\\b)(?=.*\\bsubject[a-z]*\\b).*");
    }

    private String formatSubjectAttendance(List<AttendanceSubjectSummaryDTO> summaries) {
        if (summaries == null || summaries.isEmpty()) {
            return SherpalPromptTemplate.FALLBACK_RESPONSE;
        }

        StringBuilder table = new StringBuilder("### Subject-wise Attendance\n\n")
                .append("| Subject | Present / Total Classes | Absent | Leave | Attendance |\n")
                .append("| --- | ---: | ---: | ---: | ---: |\n");

        for (AttendanceSubjectSummaryDTO summary : summaries) {
            String subject = markdownCell(summary.getSubjectCode()) + " — " + markdownCell(summary.getSubjectName());
            table.append("| ").append(subject)
                    .append(" | ").append(summary.getPresentCount()).append(" / ").append(summary.getTotalClassHeld())
                    .append(" | ").append(summary.getAbsentCount())
                    .append(" | ").append(summary.getLeave())
                    .append(" | ").append(String.format(Locale.ROOT, "%.1f%%", summary.getPercentage()))
                    .append(" |\n");
        }
        return table.toString().trim();
    }

    private String markdownCell(String value) {
        return value == null ? "—" : value.replace("|", "\\|").replaceAll("[\\r\\n]+", " ").trim();
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
