package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.DTO.SubjectAssignmentOptionDTO;
import com.chaiorcode.mycode.Entity.CourseSemesterBranchSubject;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface CourseSemesterBranchSubjectRepository extends JpaRepository<CourseSemesterBranchSubject, Long> {
    @Query("SELECT new com.chaiorcode.mycode.DTO.SubjectAssignmentOptionDTO(" +
            "csbs.id, s.code, s.name, c.name, b.name, csbs.semester) " +
            "FROM CourseSemesterBranchSubject csbs " +
            "JOIN csbs.subject s " +
            "JOIN csbs.course c " +
            "JOIN csbs.branch b " +
            "ORDER BY c.name, b.name, csbs.semester, s.code")
    List<SubjectAssignmentOptionDTO> findAssignmentOptions();

    @Query("SELECT new com.chaiorcode.mycode.DTO.SubjectAssignmentOptionDTO(" +
            "csbs.id, s.code, s.name, c.name, b.name, csbs.semester) " +
            "FROM CourseSemesterBranchSubject csbs " +
            "JOIN csbs.subject s JOIN csbs.course c JOIN csbs.branch b " +
            "WHERE (:courseId IS NULL OR c.id = :courseId) " +
            "AND (:branchId IS NULL OR b.id = :branchId) " +
            "ORDER BY csbs.semester, s.code")
    List<SubjectAssignmentOptionDTO> findAssignmentOptions(@Param("courseId") Long courseId,
                                                            @Param("branchId") Long branchId);

    @Query("""
                SELECT csbs.id
                FROM CourseSemesterBranchSubject csbs
                WHERE csbs.course.id = :courseId
                        AND csbs.semester = :semester
                        AND csbs.branch.id = :branchId
                        AND csbs.subject.id = :subjectId
""")
    Long findIdByCourseAndSemesterAndBranchAndSubject(
            @Param("courseId") Long courseId,
            @Param("semester") int semester,
            @Param("branchId") Long branchId,
            @Param("subjectId") Long subjectId
    );

}
