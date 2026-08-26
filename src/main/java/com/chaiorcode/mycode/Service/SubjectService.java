package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Repo.CourseSubjectRepo;
import com.chaiorcode.mycode.Repo.StudentRepository;
import lombok.AllArgsConstructor;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class SubjectService {

    private final StudentRepository studentRepository;
    private final CourseSubjectRepo courseSubjectRepo;
    public  List<String> getsubjects(String email) {


            Long courseid = studentRepository.findCourseIdByEmail(email);
        Long branchid = studentRepository.findBranchIdByEmail(email);
        Integer semester = studentRepository.findSemesterIdByEmail(email);

        courseSubjectRepo.findSubjectIdByCourseIdAndBranchIdAndSemester(courseid , branchid , semester);

        return courseSubjectRepo.findSubjectIdByCourseIdAndBranchIdAndSemester(courseid , branchid , semester);
    }
}
