package com.chaiorcode.mycode.DTO;



import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class BatchResponseDTO {

    private Long id;

    private String batchName;

    private Integer admissionYear;

    private Integer graduationYear;

    private String departmentName;

    private String courseName;

    private String branchName;
}
