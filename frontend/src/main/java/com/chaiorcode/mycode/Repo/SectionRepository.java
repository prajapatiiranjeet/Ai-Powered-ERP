package com.chaiorcode.mycode.Repo;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Section;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
@Repository
public interface SectionRepository extends JpaRepository<Section, Long> {

    List<Section> findByBatchIdOrderBySectionNameAsc(Long batchId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT s FROM Section s WHERE s.batch = :batch ORDER BY s.sectionName ASC")
    List<Section> findByBatchOrderBySectionNameAscForUpdate(@org.springframework.data.repository.query.Param("batch") Batch batch);
}