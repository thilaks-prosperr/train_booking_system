/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;

@Entity
@Table(name = "train_schedule", schema = "karbs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TrainSchedule {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long scheduleId;

    @ManyToOne
    @JoinColumn(name = "train_id")
    private Train train;

    @ManyToOne
    @JoinColumn(name = "station_id")
    private Station station;

    private LocalTime arrivalTime;
    private LocalTime departureTime;
    private int stopSequence;
    private int distanceFromStartKm;
}
