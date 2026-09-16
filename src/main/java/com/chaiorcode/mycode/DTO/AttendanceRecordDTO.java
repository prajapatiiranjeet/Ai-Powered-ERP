package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Enum.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.time.LocalDate;

@Getter
@AllArgsConstructor
public class AttendanceRecordDTO {
    private Long offeringId;
    private String subjectCode;
    private String subjectName;
    private LocalDate date;
    private AttendanceStatus status;
}