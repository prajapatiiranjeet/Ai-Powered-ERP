package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceSubjectSummaryDTO {
    private Long offeringId;
    private String subjectCode;
    private String subjectName;
    private long totalClassHeld;
    private long presentCount;
    private long inactive;
    private long leave;
    private long absentCount;
    private long penalty;
    private long netPresent;
    private double percentage;
}