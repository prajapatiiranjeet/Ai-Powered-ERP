package com.chaiorcode.mycode.Service;

import com.chaiorcode.mycode.Entity.Batch;
import com.chaiorcode.mycode.Entity.Section;
import com.chaiorcode.mycode.Repo.SectionRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@RequiredArgsConstructor
@Service
public class SectionService {

    private final SectionRepository sectionRepository;   // ✅ final

    @Transactional
    public Section assignSection(Batch batch) {
        // Lock existing sections of this batch — prevents race condition
        List<Section> sections = sectionRepository
                .findByBatchOrderBySectionNameAscForUpdate(batch);

        for (Section s : sections) {
            if (s.getCurrentCount() < s.getCapacity()) {
                s.setCurrentCount(s.getCurrentCount() + 1);
                return sectionRepository.save(s);
            }
        }

        // Sab full hai ya koi section nahi -> nayi section banao
        String nextName = getNextSectionName(sections);
        Section newSection = new Section();
        newSection.setBatch(batch);
        newSection.setSectionName(nextName);
        newSection.setCurrentCount(1);
        return sectionRepository.save(newSection);
    }

    private String getNextSectionName(List<Section> existingSections) {
        if (existingSections.isEmpty()) {
            return "A";
        }
        String lastSectionName = existingSections
                .get(existingSections.size() - 1)
                .getSectionName();

        char lastChar = lastSectionName.charAt(0);
        char nextChar = (char) (lastChar + 1);
        return String.valueOf(nextChar);
    }
}