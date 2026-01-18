/*
 * Copyright (c) 2026 Thilak S. All Rights Reserved.
 *
 * This source code, inclusive of the logic, design, and intellectual property,
 * is the sole property of Thilak S.
 *
 * Created by Thilak S.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.dto;

import lombok.Data;
import java.time.LocalDate;
import java.util.List;

@Data
public class BookingRequestDTO {
    private Long userId;
    private Long trainId;
    private LocalDate journeyDate;
    private Long sourceStationId;
    private Long destStationId;
    private String coachType;
    private List<Integer> selectedSeats;
}
