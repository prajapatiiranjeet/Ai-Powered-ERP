package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Enum.AttendanceStatus;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class AttendanceMarkItem {
    // One item represents one student's status inside the selected date roster.
    @NotNull
    private Long studentId;

    @NotNull
    private AttendanceStatus status;
}
