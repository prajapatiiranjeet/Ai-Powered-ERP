package com.chaiorcode.mycode.Entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "subject_offering")
@Getter
@Setter
public class SubjectOffering {
    @Id
    @GeneratedValue
    private Long id;


    @ManyToOne
    @JoinColumn(name = "csbs_id")
    private CourseSemesterBranchSubject csbs;

    @ManyToOne
    private Section section;

    @ManyToOne
    private Faculty faculty;
}