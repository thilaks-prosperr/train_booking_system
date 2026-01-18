/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalTime;
import java.util.List;

@Data
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

    private int availableSeats;

    // New field for segments
    private List<SegmentDTO> segments;

    // ... (rest of file)

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SegmentDTO {
        private String trainName;
        private String trainNumber;
        private String sourceStationCode;
        private String destStationCode;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime departureTime;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime arrivalTime;
        private String description;
        private Long trainId;
        private Long sourceStationId;
        private Long destStationId;
        private int availableSeats;

        public SegmentDTO(String trainName, String trainNumber, String sourceStationCode, String destStationCode,
                LocalTime departureTime, LocalTime arrivalTime, String description, Long trainId, Long sourceStationId,
                Long destStationId) {
            this.trainName = trainName;
            this.trainNumber = trainNumber;
            this.sourceStationCode = sourceStationCode;
            this.destStationCode = destStationCode;
            this.departureTime = departureTime;
            this.arrivalTime = arrivalTime;
            this.description = description;
            this.trainId = trainId;
            this.sourceStationId = sourceStationId;
            this.destStationId = destStationId;
        }
    }

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

    public SearchResultDTO() {
    }

    public SearchResultDTO(String trainName, String trainNumber, LocalTime sourceTime, LocalTime destTime,
            String duration, double price, boolean isDirect, String layoverStation, List<SegmentDTO> segments,
            List<StationPointDTO> path, Long trainId, Long sourceStationId, Long destStationId,
            String sourceStationName, String sourceStationCode, String destStationName, String destStationCode) {
        this.trainName = trainName;
        this.trainNumber = trainNumber;
        this.sourceTime = sourceTime;
        this.destTime = destTime;
        this.duration = duration;
        this.price = price;
        this.isDirect = isDirect;
        this.layoverStation = layoverStation;
        this.segments = segments;
        this.path = path;
        this.trainId = trainId;
        this.sourceStationId = sourceStationId;
        this.destStationId = destStationId;
        this.sourceStationName = sourceStationName;
        this.sourceStationCode = sourceStationCode;
        this.destStationName = destStationName;
        this.destStationCode = destStationCode;
    }

    public String getTrainName() {
        return trainName;
    }

    public void setTrainName(String trainName) {
        this.trainName = trainName;
    }
    // ... getters for all ... I will skip trivial ones if not used, but safest to
    // add all or rely on public fields if I could (but I can't change access now
    // easily)
    // Actually, TrainSearchService constructs it.
    // I need to add getters for at least getSourceTime() which was flagged.

    public LocalTime getSourceTime() {
        return sourceTime;
    }

    public void setSourceTime(LocalTime sourceTime) {
        this.sourceTime = sourceTime;
    }

    // Adding minimal required getters for now to save tokens, or full? Full is
    // safer.
    public String getTrainNumber() {
        return trainNumber;
    }

    public void setTrainNumber(String trainNumber) {
        this.trainNumber = trainNumber;
    }

    public LocalTime getDestTime() {
        return destTime;
    }

    public void setDestTime(LocalTime destTime) {
        this.destTime = destTime;
    }

    public String getDuration() {
        return duration;
    }

    public void setDuration(String duration) {
        this.duration = duration;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isDirect() {
        return isDirect;
    }

    public void setDirect(boolean direct) {
        isDirect = direct;
    }

    public String getLayoverStation() {
        return layoverStation;
    }

    public void setLayoverStation(String layoverStation) {
        this.layoverStation = layoverStation;
    }

    public List<SegmentDTO> getSegments() {
        return segments;
    }

    public void setSegments(List<SegmentDTO> segments) {
        this.segments = segments;
    }

    public List<StationPointDTO> getPath() {
        return path;
    }

    public void setPath(List<StationPointDTO> path) {
        this.path = path;
    }

    public Long getTrainId() {
        return trainId;
    }

    public void setTrainId(Long trainId) {
        this.trainId = trainId;
    }

    public Long getSourceStationId() {
        return sourceStationId;
    }

    public void setSourceStationId(Long sourceStationId) {
        this.sourceStationId = sourceStationId;
    }

    public Long getDestStationId() {
        return destStationId;
    }

    public void setDestStationId(Long destStationId) {
        this.destStationId = destStationId;
    }

    public String getSourceStationName() {
        return sourceStationName;
    }

    public void setSourceStationName(String sourceStationName) {
        this.sourceStationName = sourceStationName;
    }

    public String getSourceStationCode() {
        return sourceStationCode;
    }

    public void setSourceStationCode(String sourceStationCode) {
        this.sourceStationCode = sourceStationCode;
    }

    public String getDestStationName() {
        return destStationName;
    }

    public void setDestStationName(String destStationName) {
        this.destStationName = destStationName;
    }

    public String getDestStationCode() {
        return destStationCode;
    }

    public void setDestStationCode(String destStationCode) {
        this.destStationCode = destStationCode;
    }

    @Data
    public static class StationPointDTO {
        private String code;
        private String name;
        private double lat;
        private double lng;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime arrivalTime;
        @com.fasterxml.jackson.annotation.JsonFormat(pattern = "HH:mm")
        private LocalTime departureTime;
        private Long trainId; // To identify which train implies this stop
        private String trainNumber; // Useful for timeline grouping
        private double distanceFromStartKm;

        public StationPointDTO() {
        }

        public StationPointDTO(String code, String name, double lat, double lng, LocalTime arrivalTime,
                LocalTime departureTime, Long trainId, String trainNumber, double distanceFromStartKm) {
            this.code = code;
            this.name = name;
            this.lat = lat;
            this.lng = lng;
            this.arrivalTime = arrivalTime;
            this.departureTime = departureTime;
            this.trainId = trainId;
            this.trainNumber = trainNumber;
            this.distanceFromStartKm = distanceFromStartKm;
        }

        // Getters/Setters will be generated by @Data or can be added if needed
        // explicitly.
        // Adding explicit ones just in case Lombok isn't fully picked up in this edit
        // context or for safety.
        public String getCode() {
            return code;
        }

        public void setCode(String code) {
            this.code = code;
        }

        public String getName() {
            return name;
        }

        public void setName(String name) {
            this.name = name;
        }

        public double getLat() {
            return lat;
        }

        public void setLat(double lat) {
            this.lat = lat;
        }

        public double getLng() {
            return lng;
        }

        public void setLng(double lng) {
            this.lng = lng;
        }

        public LocalTime getArrivalTime() {
            return arrivalTime;
        }

        public void setArrivalTime(LocalTime arrivalTime) {
            this.arrivalTime = arrivalTime;
        }

        public LocalTime getDepartureTime() {
            return departureTime;
        }

        public void setDepartureTime(LocalTime departureTime) {
            this.departureTime = departureTime;
        }

        public Long getTrainId() {
            return trainId;
        }

        public void setTrainId(Long trainId) {
            this.trainId = trainId;
        }

        public String getTrainNumber() {
            return trainNumber;
        }

        public void setTrainNumber(String trainNumber) {
            this.trainNumber = trainNumber;
        }

        public double getDistanceFromStartKm() {
            return distanceFromStartKm;
        }

        public void setDistanceFromStartKm(double distanceFromStartKm) {
            this.distanceFromStartKm = distanceFromStartKm;
        }
    }
}
