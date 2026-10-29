package com.chaiorcode.mycode.DTO;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.List;

@Getter
@Setter
public class AttendanceMarkRequest {
    // The request contains one offering/date and the complete set of student statuses.
    @NotNull
    private Long offeringId;

    @NotNull
    private LocalDate date;

    @NotEmpty
    @Valid
    private List<AttendanceMarkItem> records;
}
