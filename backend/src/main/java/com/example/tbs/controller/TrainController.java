package com.example.tbs.controller;

import com.example.tbs.dto.SearchResultDTO;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.repository.TrainScheduleRepository;
import org.springframework.web.bind.annotation.*;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/trains")
public class TrainController {

    private final TrainScheduleRepository trainScheduleRepository;

    public TrainController(TrainScheduleRepository trainScheduleRepository) {
        this.trainScheduleRepository = trainScheduleRepository;
    }

    @GetMapping("/{trainId}/route")
    public List<RoutePointDTO> getTrainRoute(@PathVariable Long trainId) {
        List<TrainSchedule> schedules = trainScheduleRepository.findAll().stream()
                .filter(ts -> ts.getTrain().getTrainId().equals(trainId))
                .sorted(Comparator.comparingInt(TrainSchedule::getStopSequence))
                .collect(Collectors.toList());

        return schedules.stream().map(ts -> new RoutePointDTO(
                ts.getStation().getStationName(),
                ts.getStation().getLatitude(),
                ts.getStation().getLongitude(),
                ts.getArrivalTime(),
                ts.getDepartureTime(),
                ts.getStopSequence())).collect(Collectors.toList());
    }

    public static class RoutePointDTO {
        public String stationName;
        public double lat;
        public double lng;
        public java.time.LocalTime arrival;
        public java.time.LocalTime departure;
        public int seq;

        public RoutePointDTO(String stationName, double lat, double lng, java.time.LocalTime arrival,
                java.time.LocalTime departure, int seq) {
            this.stationName = stationName;
            this.lat = lat;
            this.lng = lng;
            this.arrival = arrival;
            this.departure = departure;
            this.seq = seq;
        }
    }
}
