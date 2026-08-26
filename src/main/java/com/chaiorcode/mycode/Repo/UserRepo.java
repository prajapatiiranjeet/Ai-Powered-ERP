package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.User;
import com.chaiorcode.mycode.Enum.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepo extends JpaRepository<User, Long> {
     Optional<User> findByEmail(String email);
     long countByRole(Role role);
}
