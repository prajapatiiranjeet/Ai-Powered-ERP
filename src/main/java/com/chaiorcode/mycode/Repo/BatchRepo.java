package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface BatchRepo extends JpaRepository<Batch, Long> {

    Optional<Batch> findByDepartmentAndCourseAndBranchAndAdmissionYear(
            Department department, Course course, Branch branch, String admissionYear);

        List<Batch> findByDepartmentIdAndCourseIdAndBranchIdOrderByBatchNameAsc(
            Long departmentId, Long courseId, Long branchId);

        @Query("SELECT b FROM Batch b "
            + "WHERE (:departmentId IS NULL OR b.department.id = :departmentId) "
            + "AND (:courseId IS NULL OR b.course.id = :courseId) "
            + "AND (:branchId IS NULL OR b.branch.id = :branchId) "
            + "ORDER BY b.batchName")
        List<Batch> findAssignmentBatches(@Param("departmentId") Long departmentId,
                          @Param("courseId") Long courseId,
                          @Param("branchId") Long branchId);
}