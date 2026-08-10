package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BatchRepo extends JpaRepository<Batch, Long> {

    Optional<Batch> findByDepartmentAndCourseAndBranchAndAdmissionYear(
            Department department, Course course, Branch branch, String admissionYear);
}