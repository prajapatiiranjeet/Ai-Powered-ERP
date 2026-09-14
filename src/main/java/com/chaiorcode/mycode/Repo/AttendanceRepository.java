package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    // Used for upsert: marking the same student again on the same date updates the row.
    Optional<Attendance> findByStudentIdAndSubjectOfferingIdAndDate(Long studentId,
                                                                      Long offeringId,
                                                                      LocalDate date);

    // Loads the selected date's existing statuses before the faculty roster is displayed.
    List<Attendance> findBySubjectOfferingIdAndDate(Long offeringId, LocalDate date);

    // Fetch the subject/section graph in one query for the student's summary response.
    @Query("SELECT a FROM Attendance a "
            + "JOIN FETCH a.subjectOffering so "
            + "JOIN FETCH so.csbs csbs "
            + "JOIN FETCH csbs.subject "
            + "JOIN FETCH so.section "
            + "WHERE a.student.id = :studentId")
    List<Attendance> findByStudentIdWithOffering(@Param("studentId") Long studentId);
}