package com.chaiorcode.mycode.DTO;

import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AssignSubjectRequest {
    @NotNull
    private Long facultyId;

    @NotNull
    private Long csbsId;

    @NotNull
    private Long sectionId;
}
