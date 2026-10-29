package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.BatchRepo;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BatchService {


    private final BatchRepo batchRepo;

    @Transactional
    public Batch resolveOrCreateBatch(Department department, Course course, Branch branch) {
        int currentYear = LocalDateTime.now().getYear();
        String admissionYear = String.valueOf(currentYear);

        return batchRepo
                .findByDepartmentAndCourseAndBranchAndAdmissionYear(department, course, branch, admissionYear)
                .orElseGet(() -> {
                    int duration = course.getDuration() != null ? course.getDuration() : 0;
                    int graduationYear = currentYear + duration;
                    String batchName = currentYear + "-" + graduationYear;

                    Batch newBatch = Batch.builder()
                            .admissionYear(admissionYear)
                            .batchName(batchName)
                            .department(department)
                            .course(course)
                            .branch(branch)
                            .build();

                    return batchRepo.save(newBatch);
                });
    }
}
