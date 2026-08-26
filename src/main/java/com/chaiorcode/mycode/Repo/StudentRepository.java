package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Student;
import com.chaiorcode.mycode.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.stereotype.Repository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface StudentRepository extends JpaRepository<Student, Long> {

    Optional<Student> findByRollNo(String rollNo);

    Optional<Student> findByUser(User user);

    boolean existsByRollNo(String rollNo);

    Optional<Student> findByUserEmail(String email);

    @Query("select s.course.id from Student s where s.email = :email")
    Long findCourseIdByEmail(@Param("email") String email);

    @Query("select s.branch.id from Student s where s.email = :email")
    Long findBranchIdByEmail(@Param("email") String email);

    @Query("select s.semester from Student s where s.email = :email")
    Integer findSemesterIdByEmail(@Param("email") String email);

    boolean existsByPhone(String phone);

    @Modifying
    @Transactional
    void deleteByUserEmail(String email);


}