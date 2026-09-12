package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Enum.Role;
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
}
