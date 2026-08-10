package com.chaiorcode.mycode.Service;
import com.chaiorcode.mycode.DTO.FacultyRequestDTO;
import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Repo.FacultyRepo;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class FacultyService {

    private final FacultyRepo facultyRepo;


    public  Faculty updatefaculty(String email , FacultyRequestDTO facultyDTO) {

        Faculty faculty = facultyRepo.findByUserEmail(email)
                .orElseThrow(()-> new RuntimeException("Faculty not found"));
        faculty.setPhone(faculty.getPhone());
        faculty.setLastName(facultyDTO.getLastName());
        faculty.setAddress(facultyDTO.getAddress());
        faculty.setSpecialization(facultyDTO.getSpecialization());
        return facultyRepo.save(faculty);


    }



}
