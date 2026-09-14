package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Faculty;
import com.chaiorcode.mycode.Entity.SubjectOffering;
import com.chaiorcode.mycode.Entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.List;

@Repository
public interface FacultyRepo extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByEmail(String email);

    Optional<Faculty> findByUserEmail(String email);

    Optional<Faculty> findByUser(User user);

    @Query("select f.id from Faculty f where f.email = :email")
    Long findIdByEmail(@Param("email") String email);

    @Query("select f.id from Faculty f where f.user.email = :email")
    Long findIdByUserEmail(@Param("email") String email);

    @Query("SELECT f FROM Faculty f "
            + "WHERE (:departmentId IS NULL OR f.department.id = :departmentId) "
            + "AND (:courseId IS NULL OR f.course.id = :courseId) "
            + "AND (:branchId IS NULL OR f.branch.id = :branchId) "
            + "AND (f.active = true OR f.active IS NULL) "
            + "ORDER BY f.firstName, f.lastName")
    List<Faculty> findAssignmentFaculty(@Param("departmentId") Long departmentId,
                                        @Param("courseId") Long courseId,
                                        @Param("branchId") Long branchId);


}
