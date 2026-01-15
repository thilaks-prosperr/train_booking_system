package com.example.tbs.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.Arrays;
import java.util.List;

@RestController
@RequestMapping("/api/stations")
public class StationController {

    private final com.example.tbs.repository.StationRepository stationRepository;

    public StationController(com.example.tbs.repository.StationRepository stationRepository) {
        this.stationRepository = stationRepository;
    }

    @GetMapping
    public List<StationDTO> getAllStations() {
        return stationRepository.findAll().stream()
                .map(s -> new StationDTO(s.getStationId(), s.getStationCode(), s.getStationName(), s.getLatitude(),
                        s.getLongitude()))
                .collect(java.util.stream.Collectors.toList());
    }

    // Inner DTO for simplicity
    public static class StationDTO {
        public Long stationId;
        public String stationCode;
        public String stationName;
        public double latitude;
        public double longitude;

        public StationDTO(Long stationId, String stationCode, String stationName, double latitude, double longitude) {
            this.stationId = stationId;
            this.stationCode = stationCode;
            this.stationName = stationName;
            this.latitude = latitude;
            this.longitude = longitude;
        }
    }
}
