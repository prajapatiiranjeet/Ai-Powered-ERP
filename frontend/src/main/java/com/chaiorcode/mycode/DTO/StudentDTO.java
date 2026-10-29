package com.chaiorcode.mycode.DTO;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class StudentDTO {

    private Long id;
    private String rollNo;
    private String firstName;
    private String lastName;
    private String email;
    private String phone;
    private String address;
    private Integer semester;

    // Foreign Key IDs (Department, Course, Section link karne ke liye)
    private Long department_id;
    private Long course_id;
    private Long section_id;
    private Long batch_id;
    private Long branch_id;

    // Direct User Entity ki jagah bas userId
    private Long user_id;



}
