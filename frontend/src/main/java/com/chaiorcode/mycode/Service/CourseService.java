package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.DTO.CoursDTO;
import com.chaiorcode.mycode.Entity.Course;
import com.chaiorcode.mycode.Entity.Department;
import com.chaiorcode.mycode.Repo.CourseRepository;
import com.chaiorcode.mycode.Repo.DepartmentRepository;
import com.chaiorcode.mycode.Repo.BranchRepo;
import com.chaiorcode.mycode.Entity.Branch;
import java.util.List;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class CourseService {

    private final CourseRepository courseRepository;
    private final DepartmentRepository departmentRepository;
    private final BranchRepo branchRepo;

    @Autowired
    public CourseService(CourseRepository courseRepository, DepartmentRepository departmentRepository, BranchRepo branchRepo) {
        this.courseRepository = courseRepository;
        this.departmentRepository = departmentRepository;
        this.branchRepo = branchRepo;
    }

    public List<Course> getCourses(Long departmentId) {
        return courseRepository.findByDepartmentId(departmentId);
    }

    public List<Branch> getBranches(Long courseId) {
        return branchRepo.findByCourseId(courseId);
    }

    public long countCourses() {
        return courseRepository.count();
    }

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
