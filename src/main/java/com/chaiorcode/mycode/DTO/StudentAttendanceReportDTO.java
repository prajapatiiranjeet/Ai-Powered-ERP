package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;

@Getter
@AllArgsConstructor
public class StudentAttendanceReportDTO {
    private long noOfClasses;
    private long present;
    private long absent;
    private long leave;
    private double presentPercentage;
    private List<AttendanceSubjectSummaryDTO> subjectSummaries;
    private List<AttendanceRecordDTO> records;
}