package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Entity.*;
import lombok.Data;

@Data
public class AssignSubjectDto {

    private String email;
    private Long departmentId;
    private Long courseId;
    private Long branchId;
    private Long batchId;
    private Integer semester;
    private Long subjectId;
    private Long SectionId;
}

