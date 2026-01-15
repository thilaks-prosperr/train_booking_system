package com.example.tbs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SearchResultDTO {
    private String trainName;
    private String trainNumber;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
    private LocalTime sourceTime;
    @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
    private LocalTime destTime;
    private String duration; // e.g., "4h 10m"
    private double price;
    private boolean isDirect;
    private String layoverStation; // Null if direct

    // New field for segments
    private List<SegmentDTO> segments;

    // New field for Map Routing
    private List<StationPointDTO> path;

    // IDs required for Booking API
    private Long trainId;
    private Long sourceStationId;
    private Long destStationId;

    // Station Details for Frontend Display
    private String sourceStationName;
    private String sourceStationCode;
    private String destStationName;
    private String destStationCode;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentDTO {
        private String trainName;
        private String trainNumber;
        private String sourceStation;
        private String destStation;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime departureTime;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime arrivalTime;
        private String waitTimeAtDest; // e.g. "2hr Wait at UBL"
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StationPointDTO {
        private String code;
        private String name;
        private double lat;
        private double lng;
    }
}
