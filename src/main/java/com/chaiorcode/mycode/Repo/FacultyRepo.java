package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Faculty;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;

@Repository
public interface FacultyRepo extends JpaRepository<Faculty, Long> {

    Optional<Faculty> findByUserEmail(String email);
}
