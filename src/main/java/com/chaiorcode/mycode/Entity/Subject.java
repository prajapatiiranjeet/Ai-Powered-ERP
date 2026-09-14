package com.chaiorcode.mycode.Entity;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subject")
@Getter
@Setter
public class Subject {
    @Id
    private Long id;
    private String code;   // "BT-DS105"
    private String name;   // "Data Structures"


}
