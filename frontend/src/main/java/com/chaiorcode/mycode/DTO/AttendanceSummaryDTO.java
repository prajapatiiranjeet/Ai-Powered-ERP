package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceSummaryDTO {
    // Aggregated subject-level result shown on the student's dashboard.
    private Long offeringId;
    private String subjectCode;
    private String subjectName;
    private String sectionName;
    private long present;
    private long absent;
    private long leave;
    private long total;
    private double percentage;
}
