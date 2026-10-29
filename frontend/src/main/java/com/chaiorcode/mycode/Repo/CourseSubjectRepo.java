package com.chaiorcode.mycode.Repo;

import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public class CourseSubjectRepo {

    public List<String> findSubjectIdByCourseIdAndBranchIdAndSemester(
            Long courseId, Long branchId, Integer semester) {
        return List.of();
    }
}