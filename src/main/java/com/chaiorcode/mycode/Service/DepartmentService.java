package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.DepartmentDTO;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import org.jspecify.annotations.Nullable;
import org.springframework.stereotype.Service;

import java.util.Random;

@Service
public class DepartmentService {

    private DepartmentRepository departmentRepository;


    public  String setdepartment(DepartmentDTO dto) {
        Department department = new Department();
        department.setName(dto.getName());
        String cleanName = dto.getName().replaceAll("\\s+", "").toUpperCase();
        String prefix = cleanName.length() >= 4 ? cleanName.substring(0, 4) : cleanName;
        Random random = new Random();
        int randomNumber = 1000 + random.nextInt(9000);
        String generatedCode = prefix + "-" + randomNumber;
        department.setCode(generatedCode);
        departmentRepository.save(department);
        return "new department is setuped";
    }
}
