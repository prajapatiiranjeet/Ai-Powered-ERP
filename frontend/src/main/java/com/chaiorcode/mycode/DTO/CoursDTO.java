package com.chaiorcode.mycode.DTO;

import com.chaiorcode.mycode.Entity.Department;
import jakarta.persistence.FetchType;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CoursDTO {

    private String name; // e.g., B.Tech CSE

    private Integer duration;

    private long department_id;
}
