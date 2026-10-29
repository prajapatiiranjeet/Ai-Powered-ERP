package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.SubjectOffering;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface SubjectOfferingRepository extends JpaRepository<SubjectOffering, Long> {
    boolean existsByCsbsIdAndSectionIdAndFacultyId(Long csbsId, Long sectionId, Long facultyId);

    // Fetch the subject and section graph with the offering to avoid lazy-loading/N+1 issues.
    @Query("SELECT so FROM SubjectOffering so "
        + "JOIN FETCH so.csbs csbs "
        + "JOIN FETCH csbs.subject "
        + "JOIN FETCH so.section "
        + "WHERE so.faculty.id = :facultyId")
    List<SubjectOffering> findByFacultyId(@Param("facultyId") Long facultyId);

    // The faculty ID is part of the lookup so ownership is enforced by the query itself.
    @Query("SELECT so FROM SubjectOffering so "
        + "JOIN FETCH so.csbs csbs "
        + "JOIN FETCH csbs.subject "
        + "JOIN FETCH so.section "
        + "WHERE so.id = :offeringId AND so.faculty.id = :facultyId")
    java.util.Optional<SubjectOffering> findByIdAndFacultyId(@Param("offeringId") Long offeringId,
                                 @Param("facultyId") Long facultyId);
}
