package com.chaiorcode.mycode.Entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "course_subject")
@Getter
@Setter
public class CourseSemesterBranchSubject {
    @Id
    @GeneratedValue
    private Long id;

    // This application Subject link is used to resolve the offering's code and display name.
    @ManyToOne
    @JoinColumn(name = "course_id")
    private Course course;

    private int semester;

    @ManyToOne
    @JoinColumn(name = "branch_id")
    private Branch branch;

    @ManyToOne
    @JoinColumn(name = "subject_id")
    private Subject subject;


}
