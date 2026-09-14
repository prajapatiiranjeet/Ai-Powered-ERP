package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class SubjectAssignmentOptionDTO {
    private Long id;
    private String subjectCode;
    private String subjectName;
    private String courseName;
    private String branchName;
    private int semester;
}
