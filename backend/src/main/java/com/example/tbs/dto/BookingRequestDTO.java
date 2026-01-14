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
