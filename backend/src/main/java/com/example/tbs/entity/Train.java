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
    private Integer totalSeatsPerCoach;
    private Integer numberOfCoaches;

    @Column(nullable = false, columnDefinition = "bigint default 100")
    private Long price = 100L;
}
