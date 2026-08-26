package com.chaiorcode.mycode.DTO;

import com.fasterxml.jackson.annotation.JsonFormat;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FacultyProfileDTO {

    private String fullName;
    private String email;
    private String employeeId;
    private String designation;
    private String department;
    private String specialization;
    private String highestQualification;
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate joiningDate;
    private String phone;
    private String address;
}
