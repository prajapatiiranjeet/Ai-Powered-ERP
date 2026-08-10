package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.BatchRepo;
import com.chaiorcode.mycode.Repo.BranchRepo;
import com.chaiorcode.mycode.Repo.CourseRepository;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertSame;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
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
    void setBatch_shouldSaveAllIncomingValuesToRepository() {
        Department department = new Department();
        department.setId(10L);
        department.setName("CSE");

        Course course = new Course();
        course.setId(20L);
        course.setName("B.Tech");
        course.setDuration(4);

        Branch branch = new Branch();
        branch.setId(30L);
        branch.setName("A");

        when(departmentRepository.findById(10L)).thenReturn(Optional.of(department));
        when(courseRepository.findById(20L)).thenReturn(Optional.of(course));
        when(branchRepo.findById(30L)).thenReturn(Optional.of(branch));
        when(batchRepo.save(any(Batch.class))).thenAnswer(invocation -> {
            Batch savedBatch = invocation.getArgument(0);
            savedBatch.setId(99L);
            return savedBatch;
        });

        BatchDTO result = batchService.setBatch("2026-2030-BTech", 10L, 20L, 30L);

        assertNotNull(result);
        assertEquals("2026-2030-BTech", result.getBatchName());
        assertEquals(2026, result.getAdmissionYear());
        assertEquals(10L, result.getDepartment_id());
        assertEquals(20L, result.getCourse_id());
        assertEquals(30L, result.getBranch_id());

        ArgumentCaptor<Batch> batchCaptor = ArgumentCaptor.forClass(Batch.class);
        verify(batchRepo).save(batchCaptor.capture());

        Batch savedBatch = batchCaptor.getValue();
        assertEquals("2026-2030-BTech", savedBatch.getBatchName());
        assertEquals("2026", savedBatch.getAdmissionYear(currentYear));
        assertSame(department, savedBatch.getDepartment());
        assertSame(course, savedBatch.getCourse());
        assertSame(branch, savedBatch.getBranch());
    }
}
