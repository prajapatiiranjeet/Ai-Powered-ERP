package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Entity.Section;
import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Repo.BatchRepo;
import com.chaiorcode.mycode.Repo.BranchRepo;
import com.chaiorcode.mycode.Repo.CourseRepository;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import com.chaiorcode.mycode.Repo.SectionRepository;
import com.chaiorcode.mycode.Repo.StudentRepository;
import com.chaiorcode.mycode.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class StudentService {

    private final StudentRepository studentRepository;
    private final UserRepo userRepo;
    private final DepartmentRepository departmentRepository;
    private final CourseRepository courseRepository;
    private final SectionRepository sectionRepository;
    private final BatchRepo batchRepo;
    private final BranchRepo branchRepo;

    public Student updateStudent(String email, StudentDTO studentDTO){
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (studentDTO.getFirstName() != null) student.setFirstName(studentDTO.getFirstName());
        if (studentDTO.getLastName() != null) student.setLastName(studentDTO.getLastName());
        if (studentDTO.getPhone() != null) student.setPhone(studentDTO.getPhone());
        if (studentDTO.getAddress() != null) student.setAddress(studentDTO.getAddress());

        if (studentDTO.getSemester() != null) student.setSemester(studentDTO.getSemester());

        // Department Link
        if (studentDTO.getDepartment_id() != null) {
            Department department = departmentRepository.findById(studentDTO.getDepartment_id())
                    .orElseThrow(() -> new RuntimeException("Department not found with ID: " + studentDTO.getDepartment_id()));
            student.setDepartment(department);
        }

        // Course Link
        if (studentDTO.getCourse_id() != null) {
            Course course = courseRepository.findById(studentDTO.getCourse_id())
                    .orElseThrow(() -> new RuntimeException("Course not found with ID: " + studentDTO.getCourse_id()));
            student.setCourse(course);
        }

        // Section Link
        if (studentDTO.getSection_id() != null) {
            Section section = sectionRepository.findById(studentDTO.getSection_id())
                    .orElseThrow(() -> new RuntimeException("Section not found with ID: " + studentDTO.getSection_id()));
            student.setSection(section);
        }

        // Batch Link
        if (studentDTO.getBatch_id() != null) {
            Batch batch = batchRepo.findById(studentDTO.getBatch_id())
                    .orElseThrow(() -> new RuntimeException("Batch not found with ID: " + studentDTO.getBatch_id()));
            student.setBatch(batch);
        }

        // Branch Link
        if (studentDTO.getBranch_id() != null) {
            Branch branch = branchRepo.findById(studentDTO.getBranch_id())
                    .orElseThrow(() -> new RuntimeException("Branch not found with ID: " + studentDTO.getBranch_id()));
            student.setBranch(branch);
        }

        return studentRepository.save(student);
    }

    public List<String> Studentgetall(){
        return studentRepository.findAll().stream().map(Student::getFirstName).toList();
    }

    public String deleteStudent(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        String name = student.getFirstName();
        studentRepository.deleteByUserEmail(email);
        return name;
    }

    public CreateUserDto viewprofilebyEmail(String email) {
        User user = userRepo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Server error"));
        CreateUserDto dto = new CreateUserDto();
        dto.setEmail(user.getEmail());
        dto.setName(user.getName());
        return dto;
    }


}

