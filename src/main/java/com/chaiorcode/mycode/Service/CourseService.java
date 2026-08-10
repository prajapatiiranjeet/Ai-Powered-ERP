package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CoursDTO;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.CourseRepository;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import org.jspecify.annotations.Nullable;

public class CourseService {
    private CourseRepository courseRepository;
    private DepartmentRepository departmentRepository;

    public  String insertcourse(CoursDTO coursDTO) {
        Course course = new Course();
        course.setName(coursDTO.getName());
        course.setDuration(coursDTO.getDuration());
        Department department = departmentRepository.findById(coursDTO.getDepartment_id())
                .orElseThrow(() -> new RuntimeException("Department not found"));

        course.setDepartment(department);
        courseRepository.save(course);
         return "Course inserted successfully";
    }
}
