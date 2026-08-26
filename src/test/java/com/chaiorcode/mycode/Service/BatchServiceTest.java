package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.BatchRepo;
import com.chaiorcode.mycode.Repo.BranchRepo;
import com.chaiorcode.mycode.Repo.CourseRepository;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class BatchServiceTest {

    @Mock
    private BatchRepo batchRepo;

    @Mock
    private BranchRepo branchRepo;

    @Mock
    private DepartmentRepository departmentRepository;

    @Mock
    private CourseRepository courseRepository;

    @InjectMocks
    private BatchService batchService;

    @Test
    void resolveOrCreateBatch_shouldReturnBatch() {
        Department department = new Department();
        department.setId(10L);
        department.setName("CSE");

        Course course = new Course();
        course.setId(20L);
        course.setName("B.Tech");
        course.setDuration(4);

        when(batchRepo.save(any(Batch.class))).thenAnswer(invocation -> invocation.getArgument(0));

        Batch batch = batchService.resolveOrCreateBatch(department, course, null);
        assertNotNull(batch);
    }
}
