package com.chaiorcode.mycode.Entity;

import com.chaiorcode.mycode.Enum.AttendanceStatus;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "attendance", uniqueConstraints = @UniqueConstraint(
    name = "uk_attendance_student_offering_date",
    columnNames = {"student_id", "subject_offering_id", "date"}))
public class Attendance {
    @Id
    @GeneratedValue


    private Long id;

    // One attendance row represents one student's status for one class on one date.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "subject_offering_id", nullable = false)
    private SubjectOffering subjectOffering;

    @Column(nullable = false)
    private LocalDate date;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AttendanceStatus status;

}
