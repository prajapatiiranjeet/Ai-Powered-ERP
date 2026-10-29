package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Enum.Designation;
import com.chaiorcode.mycode.Enum.Gender;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.Column;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.NonNull;
import lombok.Setter;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Getter
@Setter
public class  CreateUserDto {

    @NotBlank(message = "Name is required")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NonNull
    @NotBlank
    private String password;



    @CreationTimestamp
    @Column(nullable = false, updatable = false)
    @JsonFormat(pattern = "yyyy-MM-dd HH:mm:ss")
    private LocalDateTime createdAt;






    // Optional fields for registration (Department, Course, Batch, Section, Branch linking)
//    @JsonAlias({"department_id"})
    private Long departmentId;

//    @JsonAlias({"course_id"})
    private Long courseId;

//    @JsonAlias({"section_id"})
    private Long sectionId;

//    @JsonAlias({"batch_id"})
    private Long batchId;

//    @JsonAlias({"branch_id"})
    private Long branchId;

    private Gender gender;

    public Designation designation;

    // NOTE:
    // Role field request me aa sakta hai, but AuthService register methods role ko endpoints ke basis pe force karte hai.
    // Example: /register-admin => Role.ADMIN, /register-student => Role.STUDENTS
}
