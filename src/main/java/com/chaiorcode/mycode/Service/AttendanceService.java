package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.AttendanceMarkItem;
import com.chaiorcode.mycode.DTO.AttendanceMarkRequest;
import com.chaiorcode.mycode.DTO.AttendanceRosterItem;
import com.chaiorcode.mycode.DTO.AttendanceSummaryDTO;
import com.chaiorcode.mycode.Entity.Attendance;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Entity.SubjectOffering;
import com.chaiorcode.mycode.Enum.AttendanceStatus;
import com.chaiorcode.mycode.Repo.AttendanceRepository;
import com.chaiorcode.mycode.Repo.FacultyRepo;
import com.chaiorcode.mycode.Repo.StudentRepository;
import com.chaiorcode.mycode.Repo.SubjectOfferingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AttendanceService {
    private final AttendanceRepository attendanceRepository;
    private final FacultyRepo facultyRepo;
    private final StudentRepository studentRepository;
    private final SubjectOfferingRepository subjectOfferingRepository;

    @Transactional(readOnly = true)
    public List<AttendanceRosterItem> getRoster(String facultyEmail, Long offeringId, LocalDate date) {
        // Ownership is checked before reading the roster, so a faculty member cannot inspect another faculty member's class.
        SubjectOffering offering = getOwnedOffering(facultyEmail, offeringId);
        Map<Long, com.chaiorcode.mycode.Enum.AttendanceStatus> statuses = attendanceRepository
                .findBySubjectOfferingIdAndDate(offeringId, date)
                .stream()
            .collect(Collectors.toMap(a -> a.getStudent().getId(), Attendance::getStatus, (first, ignored) -> first));

        // Roster membership comes from the offering's section, not from client-provided student IDs.
        return studentRepository.findBySectionIdOrderByFirstNameAsc(offering.getSection().getId())
                .stream()
                .map(student -> new AttendanceRosterItem(
                        student.getId(),
                        student.getRollNo(),
                        fullName(student),
                        statuses.get(student.getId())))
                .toList();
    }

    @Transactional
    public List<AttendanceRosterItem> mark(String facultyEmail, AttendanceMarkRequest request) {
        // Future dates are rejected because attendance is recorded for completed class dates.
        if (request.getDate().isAfter(LocalDate.now())) {
            throw new IllegalArgumentException("Attendance date cannot be in the future");
        }

        SubjectOffering offering = getOwnedOffering(facultyEmail, request.getOfferingId());
        // A duplicate student in one payload would make the request ambiguous.
        Set<Long> requestedStudentIds = request.getRecords().stream()
                .map(AttendanceMarkItem::getStudentId)
                .collect(Collectors.toSet());
        if (requestedStudentIds.size() != request.getRecords().size()) {
            throw new IllegalArgumentException("Each student may appear only once per attendance request");
        }

        Map<Long, Student> students = studentRepository.findAllById(requestedStudentIds)
                .stream()
                .collect(Collectors.toMap(Student::getId, student -> student));
        if (students.size() != requestedStudentIds.size()) {
            throw new IllegalArgumentException("One or more students do not exist");
        }

        for (AttendanceMarkItem item : request.getRecords()) {
            Student student = students.get(item.getStudentId());
            // A faculty member may mark only students from this offering's section.
            if (student.getSection() == null
                    || !student.getSection().getId().equals(offering.getSection().getId())) {
                throw new IllegalArgumentException("Student does not belong to this offering section");
            }

            // Find-or-create gives repeat submissions update semantics instead of duplicate rows.
            Attendance attendance = attendanceRepository
                    .findByStudentIdAndSubjectOfferingIdAndDate(student.getId(), offering.getId(), request.getDate())
                    .orElseGet(Attendance::new);
            attendance.setStudent(student);
            attendance.setSubjectOffering(offering);
            attendance.setDate(request.getDate());
            attendance.setStatus(item.getStatus());
            attendanceRepository.save(attendance);
        }

        return getRoster(facultyEmail, request.getOfferingId(), request.getDate());
    }

    @Transactional(readOnly = true)
    public List<AttendanceSummaryDTO> getStudentSummary(String studentEmail) {
        Student student = studentRepository.findByUserEmail(studentEmail)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        // Group records by subject offering so each subject gets one summary row.
        Map<Long, List<Attendance>> byOffering = attendanceRepository.findByStudentIdWithOffering(student.getId())
                .stream()
                .collect(Collectors.groupingBy(a -> a.getSubjectOffering().getId()));

        return byOffering.values().stream()
                .map(this::toSummary)
                .sorted((left, right) -> left.getSubjectCode().compareToIgnoreCase(right.getSubjectCode()))
                .toList();
    }

    private SubjectOffering getOwnedOffering(String facultyEmail, Long offeringId) {
        // Resolve the authenticated faculty email to an ID and scope the offering query by that ID.
        Long facultyId = facultyRepo.findIdByUserEmail(facultyEmail);
        if (facultyId == null) {
            throw new IllegalArgumentException("Faculty not found");
        }
        return subjectOfferingRepository.findByIdAndFacultyId(offeringId, facultyId)
                .orElseThrow(() -> new IllegalArgumentException("Offering not found for this faculty member"));
    }

    private AttendanceSummaryDTO toSummary(List<Attendance> records) {
        SubjectOffering offering = records.get(0).getSubjectOffering();
        long present = records.stream().filter(record -> record.getStatus() == AttendanceStatus.PRESENT).count();
        long absent = records.stream().filter(record -> record.getStatus() == AttendanceStatus.ABSENT).count();
        long leave = records.stream().filter(record -> record.getStatus() == AttendanceStatus.LEAVE).count();
        long total = records.size();
        // Percentage is PRESENT divided by all recorded outcomes, rounded to two decimals.
        double percentage = total == 0 ? 0 : Math.round((present * 10000.0) / total) / 100.0;
        return new AttendanceSummaryDTO(
                offering.getId(),
                offering.getCsbs().getSubject().getCode(),
                offering.getCsbs().getSubject().getName(),
                offering.getSection().getSectionName(),
                present,
                absent,
                leave,
                total,
                percentage);
    }

    private String fullName(Student student) {
        String firstName = student.getFirstName() == null ? "" : student.getFirstName().trim();
        String lastName = student.getLastName() == null ? "" : student.getLastName().trim();
        return (firstName + " " + lastName).trim();
    }
}
