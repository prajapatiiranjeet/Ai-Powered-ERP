package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Enum.Role;
import com.chaiorcode.mycode.DTO.AdminUserOptionDTO;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
     Optional<User> findByEmail(String email);
     long countByRole(Role role);

    @Query("select u.name from User u where u.email = :email")
    String findNameByEmail(@Param("email") String email);

    @Query("SELECT new com.chaiorcode.mycode.DTO.AdminUserOptionDTO(u.id, u.name, u.email, u.role) "
            + "FROM User u "
            + "LEFT JOIN u.faculty faculty "
            + "LEFT JOIN u.student student "
            + "WHERE (:role IS NULL OR u.role = :role) "
            + "AND (:departmentId IS NULL OR u.department.id = :departmentId OR faculty.department.id = :departmentId OR student.department.id = :departmentId) "
            + "AND (:courseId IS NULL OR u.course.id = :courseId OR faculty.course.id = :courseId OR student.course.id = :courseId) "
            + "AND (:branchId IS NULL OR faculty.branch.id = :branchId OR student.branch.id = :branchId) "
            + "AND (:batchId IS NULL OR u.batch.id = :batchId OR student.batch.id = :batchId) "
            + "AND (:sectionId IS NULL OR u.section.id = :sectionId OR student.section.id = :sectionId) "
            + "ORDER BY u.name, u.email")
    java.util.List<AdminUserOptionDTO> findAdminUserOptions(@Param("role") Role role,
                                                              @Param("departmentId") Long departmentId,
                                                              @Param("courseId") Long courseId,
                                                              @Param("branchId") Long branchId,
                                                              @Param("batchId") Long batchId,
                                                              @Param("sectionId") Long sectionId);
}
