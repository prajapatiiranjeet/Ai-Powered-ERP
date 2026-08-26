package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.DTO.FacultyProfileDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.Repo.FacultyRepo;
import com.chaiorcode.mycode.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Enum.Designation;
import com.chaiorcode.mycode.Enum.Gender;
import java.time.LocalDate;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepo facultyRepo;
    private final UserRepo userRepo;

    public long countFaculty() {
        long facultyCount = facultyRepo.count();
        long userFacultyCount = userRepo.countByRole(Role.FACULTY);
        return Math.max(facultyCount, userFacultyCount);
    }

    @Transactional
    public FacultyProfileDTO viewProfile(String email) {
        User user = userRepo.findByEmail(email).orElse(null);

        java.util.Optional<Faculty> facultyOpt = java.util.Optional.empty();
        if (user != null) {
            facultyOpt = facultyRepo.findByUser(user);
        }
        if (facultyOpt.isEmpty()) {
            facultyOpt = facultyRepo.findByUserEmail(email);
        }
        if (facultyOpt.isEmpty()) {
            facultyOpt = facultyRepo.findByEmail(email);
        }

        if (facultyOpt.isPresent()) {
            Faculty faculty = facultyOpt.get();
            if (user == null) {
                user = faculty.getUser();
            }

            String fullName = faculty.getFirstName();
            if (faculty.getLastName() != null && !faculty.getLastName().isBlank()) {
                fullName += " " + faculty.getLastName();
            } else if ((fullName == null || fullName.isBlank()) && user != null && user.getName() != null) {
                fullName = user.getName();
            }
            if (fullName == null || fullName.isBlank()) {
                fullName = "Faculty";
            }

            String employeeId = faculty.getEmployeeId();
            if ((employeeId == null || employeeId.isBlank()) && user != null) {
                employeeId = "NIU-EMP-" + user.getId();
            } else if (employeeId == null || employeeId.isBlank()) {
                employeeId = "NIU-EMP-" + faculty.getId();
            }

            String designation = faculty.getDesignation() != null ? faculty.getDesignation().name()
                    : Designation.ASSISTANT_PROFESSOR.name();
            String department = faculty.getDepartment() != null ? faculty.getDepartment().getName()
                    : (user != null && user.getDepartment() != null ? user.getDepartment().getName() : "Not Assigned");

            String specialization = (faculty.getSpecialization() != null && !faculty.getSpecialization().isBlank())
                    ? faculty.getSpecialization()
                    : "General / Academic";
            String qualification = (faculty.getHighestQualification() != null
                    && !faculty.getHighestQualification().isBlank()) ? faculty.getHighestQualification()
                            : "Master's Degree";
            LocalDate joiningDate = faculty.getJoiningDate() != null ? faculty.getJoiningDate() : LocalDate.now();
            String phone = (faculty.getPhone() != null && !faculty.getPhone().isBlank()) ? faculty.getPhone()
                    : "Not Provided";
            String address = (faculty.getAddress() != null && !faculty.getAddress().isBlank()) ? faculty.getAddress()
                    : "Not Provided";
            String facultyEmail = (faculty.getEmail() != null && !faculty.getEmail().isBlank()) ? faculty.getEmail()
                    : (user != null && user.getEmail() != null ? user.getEmail() : email);

            return new FacultyProfileDTO(
                    fullName,
                    facultyEmail,
                    employeeId,
                    designation,
                    department,
                    specialization,
                    qualification,
                    joiningDate,
                    phone,
                    address);
        }

        // FALLBACK & AUTO-CREATE: Agar Faculty record nahi mila, to User table se
        // Faculty entity banakar save kar lo
        if (user != null) {
            Faculty newFaculty = new Faculty();
            newFaculty.setEmployeeId("NIU-EMP-" + user.getId());
            newFaculty.setFirstName(user.getName() != null ? user.getName() : "Faculty");
            newFaculty.setLastName("");
            newFaculty.setEmail(user.getEmail());
            newFaculty.setGender(Gender.MALE);
            newFaculty.setDepartment(user.getDepartment());
            newFaculty.setCourse(user.getCourse());
            newFaculty.setDesignation(Designation.ASSISTANT_PROFESSOR);
            newFaculty.setSpecialization("General / Academic");
            newFaculty.setHighestQualification("Master's Degree");
            newFaculty.setJoiningDate(LocalDate.now());
            newFaculty.setPhone("Not Provided");
            newFaculty.setAddress("Not Provided");
            newFaculty.setUser(user);

            Faculty savedFaculty = facultyRepo.save(newFaculty);

            return new FacultyProfileDTO(
                    savedFaculty.getFirstName() != null ? savedFaculty.getFirstName() : user.getName(),
                    savedFaculty.getEmail() != null ? savedFaculty.getEmail() : user.getEmail(),
                    savedFaculty.getEmployeeId(),
                    savedFaculty.getDesignation() != null ? savedFaculty.getDesignation().name()
                            : Designation.ASSISTANT_PROFESSOR.name(),
                    savedFaculty.getDepartment() != null ? savedFaculty.getDepartment().getName()
                            : (user.getDepartment() != null ? user.getDepartment().getName() : "Not Assigned"),
                    savedFaculty.getSpecialization(),
                    savedFaculty.getHighestQualification(),
                    savedFaculty.getJoiningDate(),
                    savedFaculty.getPhone(),
                    savedFaculty.getAddress());
        }

        throw new RuntimeException("User not found with email: " + email);
    }

    public Faculty updatefaculty(String email, FacultyRequestDTO facultyDTO) {

        Faculty faculty = facultyRepo.findByUserEmail(email)
                .orElseThrow(() -> new RuntimeException("Faculty not found"));
        if (facultyDTO.getPhone() != null)
            faculty.setPhone(facultyDTO.getPhone());
        faculty.setLastName(facultyDTO.getLastName());
        faculty.setAddress(facultyDTO.getAddress());
        faculty.setSpecialization(facultyDTO.getSpecialization());
        return facultyRepo.save(faculty);
    }

}
