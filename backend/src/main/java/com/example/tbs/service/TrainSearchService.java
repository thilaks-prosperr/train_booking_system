package com.example.tbs.service;

import com.example.tbs.dto.SearchResultDTO;
import com.example.tbs.entity.Station;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.repository.StationRepository;
import com.example.tbs.repository.TrainScheduleRepository;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class TrainSearchService {

        private final TrainScheduleRepository trainScheduleRepository;
        private final StationRepository stationRepository;

        public TrainSearchService(TrainScheduleRepository trainScheduleRepository,
                        StationRepository stationRepository) {
                this.trainScheduleRepository = trainScheduleRepository;
                this.stationRepository = stationRepository;
        }

        public List<SearchResultDTO> searchTrains(String sourceStationCode, String destStationCode,
                        LocalDate journeyDate) {
                Station sourceStation = stationRepository.findAll().stream()
                                .filter(s -> s.getStationCode().equalsIgnoreCase(sourceStationCode))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Source station not found"));

                Station destStation = stationRepository.findAll().stream()
                                .filter(s -> s.getStationCode().equalsIgnoreCase(destStationCode))
                                .findFirst()
                                .orElseThrow(() -> new RuntimeException("Destination station not found"));

                List<SearchResultDTO> results = new ArrayList<>();
                List<TrainSchedule> allSchedules = trainScheduleRepository.findAll();

                // 1. DIRECT TRAINS
                List<TrainSchedule> sourceSchedules = allSchedules.stream()
                                .filter(ts -> ts.getStation().getStationId().equals(sourceStation.getStationId()))
                                .collect(Collectors.toList());

                List<TrainSchedule> destSchedules = allSchedules.stream()
                                .filter(ts -> ts.getStation().getStationId().equals(destStation.getStationId()))
                                .collect(Collectors.toList());

                for (TrainSchedule src : sourceSchedules) {
                        for (TrainSchedule dst : destSchedules) {
                                if (src.getTrain().getTrainId().equals(dst.getTrain().getTrainId())) {
                                        if (src.getStopSequence() < dst.getStopSequence()) {
                                                results.add(createDirectDTO(src, dst, allSchedules));
                                        }
                                }
                        }
                }

                // 2. LAYOVER TRAINS
                // Train 1: Source -> Intermediate
                List<TrainSchedule> potentialFirstLegs = sourceSchedules; // Same as above

                for (TrainSchedule firstLegStart : potentialFirstLegs) {
                        // Find where this train goes (potential intermediates)
                        List<TrainSchedule> firstLegEnds = allSchedules.stream()
                                        .filter(ts -> ts.getTrain().getTrainId()
                                                        .equals(firstLegStart.getTrain().getTrainId()) &&
                                                        ts.getStopSequence() > firstLegStart.getStopSequence())
                                        .collect(Collectors.toList());

                        for (TrainSchedule intermediateArr : firstLegEnds) {
                                // Now find Train 2: Intermediate -> Destination
                                List<TrainSchedule> secondLegStarts = allSchedules.stream()
                                                .filter(ts -> ts.getStation().getStationId()
                                                                .equals(intermediateArr.getStation().getStationId())
                                                                &&
                                                                !ts.getTrain().getTrainId().equals(
                                                                                firstLegStart.getTrain().getTrainId())) // Different
                                                                                                                        // train
                                                .collect(Collectors.toList());

                                for (TrainSchedule intermediateDep : secondLegStarts) {
                                        if (isLayoverValid(intermediateArr.getArrivalTime(),
                                                        intermediateDep.getDepartureTime())) {
                                                // Find if this second train goes to destination
                                                TrainSchedule secondLegEnd = allSchedules.stream()
                                                                .filter(ts -> ts.getTrain().getTrainId().equals(
                                                                                intermediateDep.getTrain().getTrainId())
                                                                                &&
                                                                                ts.getStation().getStationId().equals(
                                                                                                destStation.getStationId())
                                                                                &&
                                                                                ts.getStopSequence() > intermediateDep
                                                                                                .getStopSequence())
                                                                .findFirst()
                                                                .orElse(null);

                                                if (secondLegEnd != null) {
                                                        results.add(
                                                                        createLayoverDTO(firstLegStart, intermediateArr,
                                                                                        intermediateDep, secondLegEnd,
                                                                                        allSchedules));
                                                }
                                        }
                                }
                        }
                }

                return results.stream()
                                .sorted(Comparator.comparing(SearchResultDTO::getSourceTime))
                                .collect(Collectors.toList());
        }

        private boolean isLayoverValid(LocalTime arrival, LocalTime departure) {
                if (departure.isBefore(arrival))
                        return false;
                long minutes = Duration.between(arrival, departure).toMinutes();
                return minutes >= 60;
        }

        private List<SearchResultDTO.StationPointDTO> getPath(Long trainId, int startSeq, int endSeq,
                        List<TrainSchedule> allSchedules) {
                return allSchedules.stream()
                                .filter(ts -> ts.getTrain().getTrainId().equals(trainId) &&
                                                ts.getStopSequence() >= startSeq &&
                                                ts.getStopSequence() <= endSeq)
                                .sorted(Comparator.comparingInt(TrainSchedule::getStopSequence))
                                .map(ts -> new SearchResultDTO.StationPointDTO(
                                                ts.getStation().getStationCode(),
                                                ts.getStation().getStationName(),
                                                ts.getStation().getLatitude(),
                                                ts.getStation().getLongitude()))
                                .collect(Collectors.toList());
        }

        private SearchResultDTO createDirectDTO(TrainSchedule src, TrainSchedule dst,
                        List<TrainSchedule> allSchedules) {
                double price = (dst.getDistanceFromStartKm() - src.getDistanceFromStartKm()) * 2.0;
                Duration duration = Duration.between(src.getDepartureTime(), dst.getArrivalTime());
                String durationStr = String.format("%dh %dm", duration.toHours(), duration.toMinutesPart());

                List<SearchResultDTO.StationPointDTO> path = getPath(src.getTrain().getTrainId(), src.getStopSequence(),
                                dst.getStopSequence(), allSchedules);

                return new SearchResultDTO(
                                src.getTrain().getTrainName(),
                                src.getTrain().getTrainNumber(),
                                src.getDepartureTime(),
                                dst.getArrivalTime(),
                                durationStr,
                                price,
                                true,
                                null,
                                null, // Segments
                                path // Path
                );
        }

        private SearchResultDTO createLayoverDTO(TrainSchedule t1Src, TrainSchedule t1End, TrainSchedule t2Start,
                        TrainSchedule t2End, List<TrainSchedule> allSchedules) {

                double dist1 = t1End.getDistanceFromStartKm() - t1Src.getDistanceFromStartKm();
                double dist2 = t2End.getDistanceFromStartKm() - t2Start.getDistanceFromStartKm();
                double price = (dist1 + dist2) * 2.0;

                Duration duration = Duration.between(t1Src.getDepartureTime(), t2End.getArrivalTime());
                if (duration.isNegative()) {
                        duration = duration.plusHours(24);
                }

                String durationStr = String.format("%dh %dm", duration.toHours(), duration.toMinutesPart());
                String trainName = t1Src.getTrain().getTrainName() + " -> " + t2Start.getTrain().getTrainName();
                String trainNumber = t1Src.getTrain().getTrainNumber() + "/" + t2Start.getTrain().getTrainNumber();

                // Create Segments
                List<SearchResultDTO.SegmentDTO> segments = new ArrayList<>();
                segments.add(new SearchResultDTO.SegmentDTO(
                                t1Src.getTrain().getTrainName(),
                                t1Src.getTrain().getTrainNumber(),
                                t1Src.getStation().getStationCode(),
                                t1End.getStation().getStationCode(),
                                t1Src.getDepartureTime(),
                                t1End.getArrivalTime(),
                                "Layover at " + t1End.getStation().getStationCode()));
                segments.add(new SearchResultDTO.SegmentDTO(
                                t2Start.getTrain().getTrainName(),
                                t2Start.getTrain().getTrainNumber(),
                                t2Start.getStation().getStationCode(),
                                t2End.getStation().getStationCode(),
                                t2Start.getDepartureTime(),
                                t2End.getArrivalTime(),
                                "Destination"));

                // Create Path
                List<SearchResultDTO.StationPointDTO> path1 = getPath(t1Src.getTrain().getTrainId(),
                                t1Src.getStopSequence(),
                                t1End.getStopSequence(), allSchedules);
                List<SearchResultDTO.StationPointDTO> path2 = getPath(t2Start.getTrain().getTrainId(),
                                t2Start.getStopSequence(), t2End.getStopSequence(), allSchedules);

                List<SearchResultDTO.StationPointDTO> fullPath = new ArrayList<>(path1);
                fullPath.addAll(path2);

                return new SearchResultDTO(
                                trainName,
                                trainNumber,
                                t1Src.getDepartureTime(),
                                t2End.getArrivalTime(),
                                durationStr,
                                price,
                                false,
                                t1End.getStation().getStationName(),
                                segments,
                                fullPath);
        }
}
