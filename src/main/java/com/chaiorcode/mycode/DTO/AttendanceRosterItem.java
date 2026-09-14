package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Enum.AttendanceStatus;
import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AttendanceRosterItem {
    // Used by the faculty screen to render a student and any status already saved for the date.
    private Long studentId;
    private String rollNo;
    private String studentName;
    private AttendanceStatus status;
}
