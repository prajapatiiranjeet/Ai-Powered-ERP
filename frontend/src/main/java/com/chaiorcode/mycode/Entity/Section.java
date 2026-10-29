    package com.chaiorcode.mycode.Entity;

    import jakarta.persistence.*;
    import lombok.*;

    import java.util.ArrayList;
    import java.util.List;

    @Entity
    @Table(
            name = "sections",
            uniqueConstraints = {
                    @UniqueConstraint(columnNames = {"batch_id", "section_name"})
            }
    )
    @Getter
    @Setter
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public class Section {

        @Id
        @GeneratedValue(strategy = GenerationType.IDENTITY)
        private Long id;

        @Column(name = "section_name", nullable = false)
        private String sectionName;


        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "batch_id", nullable = false)
        private Batch batch;

        @OneToMany(mappedBy = "section")
        private List<Student> students = new ArrayList<>();
        @Builder.Default
        private int capacity = 60;
        private int currentCount = 0;
    }