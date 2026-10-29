package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.AssignSubjectRequest;
import com.chaiorcode.mycode.DTO.LookupOptionDTO;
import com.chaiorcode.mycode.DTO.SubjectAssignmentOptionDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Entity.Section;
import com.chaiorcode.mycode.Entity.SubjectOffering;
import com.chaiorcode.mycode.Repo.CourseSemesterBranchSubjectRepository;
import com.chaiorcode.mycode.Repo.FacultyRepo;
import com.chaiorcode.mycode.Repo.SectionRepository;
import com.chaiorcode.mycode.Repo.SubjectOfferingRepository;
import com.chaiorcode.mycode.Repo.BatchRepo;
import lombok.RequiredArgsConstructor;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectAssignmentService {
    private final FacultyRepo facultyRepo;
    private final SectionRepository sectionRepository;
    private final CourseSemesterBranchSubjectRepository csbsRepository;
    private final SubjectOfferingRepository subjectOfferingRepository;
    private final BatchRepo batchRepo;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional(readOnly = true)
    public List<LookupOptionDTO> getFacultyOptions(Long departmentId, Long courseId, Long branchId, Long batchId) {
        if (batchId != null) {
            var batch = batchRepo.findById(batchId).orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            departmentId = batch.getDepartment().getId();
            courseId = batch.getCourse().getId();
            branchId = batch.getBranch().getId();
        }
        return facultyRepo.findAssignmentFaculty(departmentId, courseId, branchId).stream()
                .map(faculty -> new LookupOptionDTO(faculty.getId(), faculty.getFirstName()
                        + (faculty.getLastName() == null ? "" : " " + faculty.getLastName())
                        + " - " + faculty.getEmail()))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<SubjectAssignmentOptionDTO> getSubjectOptions(Long courseId, Long branchId) {
        return csbsRepository.findAssignmentOptions(courseId, branchId);
    }

    @Transactional
    public List<LookupOptionDTO> getSectionOptions(Long batchId) {
        var sectionOptions = batchId == null
            ? sectionRepository.findAll()
            : sectionRepository.findByBatchIdOrderBySectionNameAsc(batchId);
        if (batchId != null && sectionOptions.isEmpty()) {
            var batch = batchRepo.findById(batchId)
                    .orElseThrow(() -> new IllegalArgumentException("Batch not found"));
            Section defaultSection = new Section();
            defaultSection.setBatch(batch);
            defaultSection.setSectionName("A");
            sectionOptions = List.of(sectionRepository.save(defaultSection));
        }
        return sectionOptions.stream()
                .map(section -> new LookupOptionDTO(
                        section.getId(),
                        section.getBatch().getBatchName() + " - Section " + section.getSectionName()))
                .toList();
    }

    @Transactional
    public List<LookupOptionDTO> getBatchOptions(Long departmentId, Long courseId, Long branchId) {
        List<com.chaiorcode.mycode.Entity.Batch> batches = batchRepo
                .findByDepartmentIdAndCourseIdAndBranchIdOrderByBatchNameAsc(departmentId, courseId, branchId);
        if (batches.isEmpty() && departmentId != null && courseId != null && branchId != null) {
            int currentYear = LocalDateTime.now().getYear();
                var department = entityManager.getReference(com.chaiorcode.mycode.Entity.Department.class, departmentId);
                var course = entityManager.getReference(com.chaiorcode.mycode.Entity.Course.class, courseId);
                var branch = entityManager.getReference(com.chaiorcode.mycode.Entity.Branch.class, branchId);
                int duration = course.getDuration() == null ? 0 : course.getDuration();
            var batch = com.chaiorcode.mycode.Entity.Batch.builder()
                    .admissionYear(String.valueOf(currentYear))
                    .batchName(currentYear + "-" + (currentYear + duration))
                    .department(department)
                    .course(course)
                    .branch(branch)
                    .build();
            batches = List.of(batchRepo.save(batch));
        }
        return batches.stream()
                .map(batch -> new LookupOptionDTO(batch.getId(), batch.getBatchName()))
                .toList();
    }

    @Transactional
    public SubjectOffering assign(AssignSubjectRequest request) {
        Faculty faculty = facultyRepo.findById(request.getFacultyId())
                .orElseThrow(() -> new IllegalArgumentException("Faculty not found"));
        var csbs = csbsRepository.findById(request.getCsbsId())
                .orElseThrow(() -> new IllegalArgumentException("Subject mapping not found"));
        Section section = sectionRepository.findById(request.getSectionId())
                .orElseThrow(() -> new IllegalArgumentException("Section not found"));

        if (section.getBatch() == null
                || section.getBatch().getCourse() == null
                || section.getBatch().getBranch() == null
                || csbs.getCourse() == null
                || csbs.getBranch() == null
                || !section.getBatch().getCourse().getId().equals(csbs.getCourse().getId())
                || !section.getBatch().getBranch().getId().equals(csbs.getBranch().getId())) {
            throw new IllegalArgumentException("Subject and section must belong to the same course and branch");
        }

        if (subjectOfferingRepository.existsByCsbsIdAndSectionIdAndFacultyId(
                request.getCsbsId(), request.getSectionId(), request.getFacultyId())) {
            throw new IllegalArgumentException("This subject is already assigned to this faculty and section");
        }

        SubjectOffering offering = new SubjectOffering();
        offering.setFaculty(faculty);
        offering.setCsbs(csbs);
        offering.setSection(section);
        return subjectOfferingRepository.save(offering);
    }
}
