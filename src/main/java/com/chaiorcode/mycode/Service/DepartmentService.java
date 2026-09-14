package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.DepartmentDTO;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import org.springframework.stereotype.Service;

import java.util.Random;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;

@Service
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    @Autowired
    public DepartmentService(DepartmentRepository departmentRepository) {
        this.departmentRepository = departmentRepository;
    }

    public List<Department> getDepartments() {
        return departmentRepository.findAll();
    }


    public  String setdepartment(DepartmentDTO dto) {
        Department department = dto.getId() == null
                ? new Department()
                : departmentRepository.findById(dto.getId())
                    .orElseThrow(() -> new IllegalArgumentException("Department not found"));
        department.setName(dto.getName());
        if (department.getCode() == null || department.getCode().isBlank()) {
            String cleanName = dto.getName().replaceAll("\\s+", "").toUpperCase();
            String prefix = cleanName.length() >= 4 ? cleanName.substring(0, 4) : cleanName;
            department.setCode(prefix + "-" + (1000 + new Random().nextInt(9000)));
        }
        departmentRepository.save(department);
        return dto.getId() == null ? "Department created successfully" : "Department updated successfully";
    }
}
