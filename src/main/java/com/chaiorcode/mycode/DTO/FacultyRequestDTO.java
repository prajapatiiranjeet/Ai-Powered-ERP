package com.chaiorcode.mycode.DTO;


import com.chaiorcode.mycode.Enum.Designation;
import com.chaiorcode.mycode.Enum.Gender;
import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDate;

@Data
public class FacultyRequestDTO {

    @NotBlank(message = "First name is required")
    private String firstName;

    private String lastName;

    @Email(message = "Invalid email")
    @NotBlank(message = "Email is required")
    private String email;

    @NotBlank(message = "Phone is required")
    @Pattern(regexp = "^[6-9]\\d{9}$", message = "Invalid phone number")
    private String phone;

    @NotBlank(message = "Address is required")
    private String address;

    @NotNull(message = "Gender is required")
    private Gender gender;


    private String dateOfBirth;

    @NotNull(message = "Department is required")
    private Long departmentId;

    @NotNull(message = "Designation is required")
    private Designation designation;

    private String specialization;

    private String highestQualification;

    @NotNull(message = "Joining date is required")
    private LocalDate joiningDate;

    private String profilePhoto;

    @NotNull(message = "User Id is required")
    private Long userId;
}
