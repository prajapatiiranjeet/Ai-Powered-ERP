package com.chaiorcode.mycode.Service;


import com.chaiorcode.mycode.DTO.SubjectOfferingDTO;
import com.chaiorcode.mycode.Entity.SubjectOffering;
import com.chaiorcode.mycode.Repo.SubjectOfferingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;


import java.util.List;
import java.util.stream.Collectors;

@Service
public class SubjectOfferingService {

    @Autowired
    private SubjectOfferingRepository subjectOfferingRepository;

    public List<SubjectOfferingDTO> getMyOfferings(Long facultyId) {
        List<SubjectOffering> offerings = subjectOfferingRepository.findByFacultyId(facultyId);
        // Convert every offering to a lightweight dropdown-friendly DTO.
        return offerings.stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    public SubjectOfferingDTO mapToDTO(SubjectOffering offering) {
        // Subject stores these values as code/name; the API exposes clearer DTO names.
        SubjectOfferingDTO dto = new SubjectOfferingDTO();
        dto.setOfferingId(offering.getId());

        dto.setSubjectCode(offering.getCsbs().getSubject().getCode());
        dto.setSubjectName(offering.getCsbs().getSubject().getName());
        dto.setSectionName(offering.getSection().getSectionName());
        return dto;
    }
}