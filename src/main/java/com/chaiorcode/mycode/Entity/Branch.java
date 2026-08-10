package com.chaiorcode.mycode.Entity;

import jakarta.persistence.*;

@Entity
@Table(name="branches")
public class Branch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name; // e.g., B.Tech CSE

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;


}
