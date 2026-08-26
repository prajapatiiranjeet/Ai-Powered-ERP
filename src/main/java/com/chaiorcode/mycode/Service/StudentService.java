package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CreateUserDto;
import com.chaiorcode.mycode.DTO.StudentDTO;
import com.chaiorcode.mycode.DTO.StudentProfileDTO;
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
import org.springframework.transaction.annotation.Transactional;

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

    public Student updateStudent(String email, StudentDTO studentDTO) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Student not found"));

        if (studentDTO.getFirstName() != null)
            student.setFirstName(studentDTO.getFirstName());
        if (studentDTO.getLastName() != null)
            student.setLastName(studentDTO.getLastName());
        if (studentDTO.getPhone() != null)
            student.setPhone(studentDTO.getPhone());
        if (studentDTO.getAddress() != null)
            student.setAddress(studentDTO.getAddress());

        if (studentDTO.getSemester() != null)
            student.setSemester(studentDTO.getSemester());

        // Department Link
        if (studentDTO.getDepartment_id() != null) {
            Department department = departmentRepository.findById(studentDTO.getDepartment_id())
                    .orElseThrow(() -> new RuntimeException(
                            "Department not found with ID: " + studentDTO.getDepartment_id()));
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
                    .orElseThrow(
                            () -> new RuntimeException("Section not found with ID: " + studentDTO.getSection_id()));
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

    public List<String> Studentgetall() {
        return studentRepository.findAll().stream().map(Student::getFirstName).toList();
    }

    public String deleteStudent(String email) {
        Student student = studentRepository.findByUserEmail(email)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));
        String name = student.getFirstName();
        studentRepository.deleteByUserEmail(email);
        return name;
    }

    @Transactional
    public StudentProfileDTO viewprofilebyEmail(String email) {
        User user = userRepo.findByEmail(email).orElse(null);

        java.util.Optional<Student> studentOpt = java.util.Optional.empty();
        if (user != null) {
            studentOpt = studentRepository.findByUser(user);
        }
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByUserEmail(email);
        }
        if (studentOpt.isEmpty()) {
            studentOpt = studentRepository.findByEmail(email);
        }

        if (studentOpt.isPresent()) {
            Student student = studentOpt.get();
            if (user == null) {
                user = student.getUser();
            }

            String fullName = student.getFirstName();
            if (student.getLastName() != null && !student.getLastName().isBlank()) {
                fullName += " " + student.getLastName();
            } else if ((fullName == null || fullName.isBlank()) && user != null && user.getName() != null) {
                fullName = user.getName();
            }
            if (fullName == null || fullName.isBlank()) {
                fullName = "Student";
            }

            String rollNo = student.getRollNo();
            if ((rollNo == null || rollNo.isBlank()) && user != null) {
                rollNo = "NIU-" + user.getId();
            } else if (rollNo == null || rollNo.isBlank()) {
                rollNo = "NIU-" + student.getId();
            }

            Integer semester = student.getSemester() != null ? student.getSemester() : 1;

            String courseName = student.getCourse() != null ? student.getCourse().getName()
                    : (user != null && user.getCourse() != null ? user.getCourse().getName() : "Not Assigned");
            String branchName = student.getBranch() != null ? student.getBranch().getName() : "General";
            String deptName = student.getDepartment() != null ? student.getDepartment().getName()
                    : (user != null && user.getDepartment() != null ? user.getDepartment().getName() : "Not Assigned");
            String sectionName = student.getSection() != null ? student.getSection().getSectionName()
                    : (user != null && user.getSection() != null ? user.getSection().getSectionName() : "Not Assigned");
            String batchName = student.getBatch() != null ? student.getBatch().getBatchName()
                    : (user != null && user.getBatch() != null ? user.getBatch().getBatchName() : "Not Assigned");

            String phone = (student.getPhone() != null && !student.getPhone().isBlank()) ? student.getPhone()
                    : "Not Provided";
            String address = (student.getAddress() != null && !student.getAddress().isBlank()) ? student.getAddress()
                    : "Not Provided";
            String studentEmail = (student.getEmail() != null && !student.getEmail().isBlank()) ? student.getEmail()
                    : (user != null && user.getEmail() != null ? user.getEmail() : email);

            return new StudentProfileDTO(
                    fullName,
                    studentEmail,
                    rollNo,
                    semester,
                    courseName,
                    branchName,
                    deptName,
                    sectionName,
                    batchName,
                    phone,
                    address);
        }

        // FALLBACK & AUTO-CREATE: Agar Student record nahi mila, to User table se
        // Student entity banakar save kar lo
        if (user != null) {
            Student newStudent = new Student();
            newStudent.setRollNo("NIU-" + user.getId());
            newStudent.setFirstName(user.getName() != null ? user.getName() : "Student");
            newStudent.setLastName("");
            newStudent.setEmail(user.getEmail());
            newStudent.setSemester(1);
            newStudent.setPhone("Not Provided");
            newStudent.setAddress("Not Provided");
            newStudent.setUser(user);
            newStudent.setDepartment(user.getDepartment());
            newStudent.setCourse(user.getCourse());
            newStudent.setSection(user.getSection());
            newStudent.setBatch(user.getBatch());

            Student savedStudent = studentRepository.save(newStudent);

            return new StudentProfileDTO(
                    savedStudent.getFirstName() != null ? savedStudent.getFirstName() : user.getName(),
                    savedStudent.getEmail() != null ? savedStudent.getEmail() : user.getEmail(),
                    savedStudent.getRollNo(),
                    savedStudent.getSemester() != null ? savedStudent.getSemester() : 1,
                    savedStudent.getCourse() != null ? savedStudent.getCourse().getName()
                            : (user.getCourse() != null ? user.getCourse().getName() : "Not Assigned"),
                    "General",
                    savedStudent.getDepartment() != null ? savedStudent.getDepartment().getName()
                            : (user.getDepartment() != null ? user.getDepartment().getName() : "Not Assigned"),
                    savedStudent.getSection() != null ? savedStudent.getSection().getSectionName()
                            : (user.getSection() != null ? user.getSection().getSectionName() : "Not Assigned"),
                    savedStudent.getBatch() != null ? savedStudent.getBatch().getBatchName()
                            : (user.getBatch() != null ? user.getBatch().getBatchName() : "Not Assigned"),
                    savedStudent.getPhone(),
                    savedStudent.getAddress());
        }

        throw new RuntimeException("User not found with email: " + email);
    }

}
