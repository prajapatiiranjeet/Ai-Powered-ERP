package com.chaiorcode.mycode.DTO;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {

    private String fullName;
    private String email;
    private String rollNo;
    private Integer semester;
    private String course;
    private String branch;
    private String department;
    private String section;
    private String batch;
    private String phone;
    private String address;
}
