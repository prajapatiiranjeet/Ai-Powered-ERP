package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Branch;
import com.chaiorcode.mycode.Entity.Course;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepo extends JpaRepository<Branch, Long> {
    @Query("SELECT b.name FROM Branch b WHERE b.id = :id")
    Optional<Branch> findNameById(@Param("id") Long id);
}
