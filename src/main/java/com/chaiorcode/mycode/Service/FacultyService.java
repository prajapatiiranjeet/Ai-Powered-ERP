package com.chaiorcode.mycode.Service;
import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.Repo.FacultyRepo;
import com.chaiorcode.mycode.Repo.UserRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

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

    public  Faculty updatefaculty(String email , FacultyRequestDTO facultyDTO) {

        Faculty faculty = facultyRepo.findByUserEmail(email)
                .orElseThrow(()-> new RuntimeException("Faculty not found"));
        if (facultyDTO.getPhone() != null) faculty.setPhone(facultyDTO.getPhone());
        faculty.setLastName(facultyDTO.getLastName());
        faculty.setAddress(facultyDTO.getAddress());
        faculty.setSpecialization(facultyDTO.getSpecialization());
        return facultyRepo.save(faculty);
    }



}
