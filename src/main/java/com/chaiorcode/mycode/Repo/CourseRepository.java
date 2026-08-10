package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CourseRepository extends JpaRepository<Course, Long> {
    Optional<Course> findByNameIgnoreCase(String name);
    Optional<Course> findNameById(long id);
    Optional<Integer> findDurationById(Long id);

    int findDurationByName(Course course);
}
