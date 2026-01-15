package com.example.tbs.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "train", schema = "karbs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Train {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long trainId;

    private String trainNumber;
    private String trainName;
    private int totalSeatsPerCoach;
    private int numberOfCoaches;

    @Column(nullable = false, columnDefinition = "bigint default 100")
    private Long price = 100L;
}
