package com.chaiorcode.mycode.DTO;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class SectionResponseDTO {

    private Long id;

    private String sectionName;   // e.g., "Sec-A"

    private Integer intake;       // e.g., 60

    private Long batchId;

    private String batchName;     // e.g., "2026-2030-CSE" (Client ko direct name dikhane ke liye)
}