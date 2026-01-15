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
        private final com.example.tbs.repository.BookedSeatRepository bookedSeatRepository;

        public TrainSearchService(TrainScheduleRepository trainScheduleRepository,
                        StationRepository stationRepository,
                        com.example.tbs.repository.BookedSeatRepository bookedSeatRepository) {
                this.trainScheduleRepository = trainScheduleRepository;
                this.stationRepository = stationRepository;
                this.bookedSeatRepository = bookedSeatRepository;
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
                                                results.add(createDirectDTO(src, dst, allSchedules, journeyDate));
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
                                // Now find Train 2: Intermediate -> Destination (Single Layover)
                                List<TrainSchedule> secondLegStarts = allSchedules.stream()
                                                .filter(ts -> ts.getStation().getStationId()
                                                                .equals(intermediateArr.getStation().getStationId())
                                                                &&
                                                                !ts.getTrain().getTrainId().equals(
                                                                                firstLegStart.getTrain().getTrainId()))
                                                .collect(Collectors.toList());

                                for (TrainSchedule intermediateDep : secondLegStarts) {
                                        if (isLayoverValid(intermediateArr.getArrivalTime(),
                                                        intermediateDep.getDepartureTime())) {

                                                // OPTION A: Train 2 goes to Destination (Single Layover)
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
                                                                                        allSchedules, journeyDate));
                                                }

                                                // OPTION B: Train 2 goes to Intermediate 2 (Double Layover)
                                                List<TrainSchedule> secondLegEnds = allSchedules.stream()
                                                                .filter(ts -> ts.getTrain().getTrainId()
                                                                                .equals(intermediateDep.getTrain()
                                                                                                .getTrainId())
                                                                                &&
                                                                                ts.getStopSequence() > intermediateDep
                                                                                                .getStopSequence())
                                                                .collect(Collectors.toList());

                                                for (TrainSchedule i2Arr : secondLegEnds) {
                                                        List<TrainSchedule> thirdLegStarts = allSchedules.stream()
                                                                        .filter(ts -> ts.getStation().getStationId()
                                                                                        .equals(i2Arr.getStation()
                                                                                                        .getStationId())
                                                                                        &&
                                                                                        !ts.getTrain().getTrainId()
                                                                                                        .equals(intermediateDep
                                                                                                                        .getTrain()
                                                                                                                        .getTrainId()))
                                                                        .collect(Collectors.toList());

                                                        for (TrainSchedule i2Dep : thirdLegStarts) {
                                                                if (isLayoverValid(i2Arr.getArrivalTime(),
                                                                                i2Dep.getDepartureTime())) {
                                                                        TrainSchedule thirdLegEnd = allSchedules
                                                                                        .stream()
                                                                                        .filter(ts -> ts.getTrain()
                                                                                                        .getTrainId()
                                                                                                        .equals(i2Dep.getTrain()
                                                                                                                        .getTrainId())
                                                                                                        &&
                                                                                                        ts.getStation().getStationId()
                                                                                                                        .equals(destStation
                                                                                                                                        .getStationId())
                                                                                                        &&
                                                                                                        ts.getStopSequence() > i2Dep
                                                                                                                        .getStopSequence())
                                                                                        .findFirst()
                                                                                        .orElse(null);

                                                                        if (thirdLegEnd != null) {
                                                                                results.add(createDoubleLayoverDTO(
                                                                                                firstLegStart,
                                                                                                intermediateArr,
                                                                                                intermediateDep, i2Arr,
                                                                                                i2Dep, thirdLegEnd,
                                                                                                allSchedules));
                                                                        }
                                                                }
                                                        }
                                                }

                                        }
                                }
                        }
                }

                return results.stream().sorted(Comparator.comparing(SearchResultDTO::getSourceTime))
                                .collect(Collectors.toList());

        }

        private boolean isLayoverValid(LocalTime arrival, LocalTime departure) {
                if (departure.isBefore(arrival))
                        return false;
                long minutes = Duration.between(arrival, departure).toMinutes();
                return minutes >= 60;
        }

        private int getAvailableSeats(com.example.tbs.entity.Train train, LocalDate date, int startSeq, int endSeq) {
                int totalSeats = train.getTotalSeatsPerCoach()
                                * (train.getNumberOfCoaches() > 0 ? train.getNumberOfCoaches() : 10);
                long bookedCount = bookedSeatRepository.countOverlappingBookings(train.getTrainId(), date, startSeq,
                                endSeq);
                return Math.max(0, totalSeats - (int) bookedCount);
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
                                                ts.getStation().getLongitude(),
                                                ts.getArrivalTime(),
                                                ts.getDepartureTime(),
                                                ts.getTrain().getTrainId(),
                                                ts.getTrain().getTrainNumber(),
                                                ts.getDistanceFromStartKm()))
                                .collect(Collectors.toList());
        }

        private SearchResultDTO createDirectDTO(TrainSchedule src, TrainSchedule dst,
                        List<TrainSchedule> allSchedules, LocalDate journeyDate) {
                // ... (existing logic)
                double basePrice = src.getTrain().getPrice() != null ? src.getTrain().getPrice() : 100.0;
                double distancePrice = (dst.getDistanceFromStartKm() - src.getDistanceFromStartKm()) * 2.0;
                double price = basePrice + distancePrice;
                Duration duration = Duration.between(src.getDepartureTime(), dst.getArrivalTime());
                String durationStr = String.format("%dh %dm", duration.toHours(), duration.toMinutesPart());

                List<SearchResultDTO.StationPointDTO> path = getPath(src.getTrain().getTrainId(), src.getStopSequence(),
                                dst.getStopSequence(), allSchedules);

                int available = getAvailableSeats(src.getTrain(), journeyDate, src.getStopSequence(),
                                dst.getStopSequence());

                SearchResultDTO dto = new SearchResultDTO(
                                src.getTrain().getTrainName(),
                                src.getTrain().getTrainNumber(),
                                src.getDepartureTime(),
                                dst.getArrivalTime(),
                                durationStr,
                                price,
                                true,
                                null,
                                null, // Segments
                                path, // Path
                                src.getTrain().getTrainId(),
                                src.getStation().getStationId(),
                                dst.getStation().getStationId(),
                                src.getStation().getStationName(),
                                src.getStation().getStationCode(),
                                dst.getStation().getStationName(),
                                dst.getStation().getStationCode());
                dto.setAvailableSeats(available);
                return dto;
        }

        private SearchResultDTO createLayoverDTO(TrainSchedule t1Src, TrainSchedule t1End, TrainSchedule t2Start,
                        TrainSchedule t2End, List<TrainSchedule> allSchedules, LocalDate journeyDate) {
                // ... existing layover logic
                double dist1 = t1End.getDistanceFromStartKm() - t1Src.getDistanceFromStartKm();
                double dist2 = t2End.getDistanceFromStartKm() - t2Start.getDistanceFromStartKm();

                double price1 = (t1Src.getTrain().getPrice() != null ? t1Src.getTrain().getPrice() : 100.0)
                                + (dist1 * 2.0);
                double price2 = (t2Start.getTrain().getPrice() != null ? t2Start.getTrain().getPrice() : 100.0)
                                + (dist2 * 2.0);

                double price = price1 + price2;

                Duration duration = Duration.between(t1Src.getDepartureTime(), t2End.getArrivalTime());
                if (duration.isNegative()) {
                        duration = duration.plusHours(24);
                }

                String durationStr = String.format("%dh %dm", duration.toHours(), duration.toMinutesPart());
                String trainName = t1Src.getTrain().getTrainName() + " -> " + t2Start.getTrain().getTrainName();
                String trainNumber = t1Src.getTrain().getTrainNumber() + "/" + t2Start.getTrain().getTrainNumber();

                // Assuming journeyDate is passed somehow. I'll fix the caller in next step or
                // use a hack if needed.
                // Wait, I am rewriting the file content. I can change the signature to accept
                // journeyDate!

                SearchResultDTO.SegmentDTO seg1 = new SearchResultDTO.SegmentDTO(
                                t1Src.getTrain().getTrainName(),
                                t1Src.getTrain().getTrainNumber(),
                                t1Src.getStation().getStationCode(),
                                t1End.getStation().getStationCode(),
                                t1Src.getDepartureTime(),
                                t1End.getArrivalTime(),
                                "Layover at " + t1End.getStation().getStationCode(),
                                t1Src.getTrain().getTrainId(),
                                t1Src.getStation().getStationId(),
                                t1End.getStation().getStationId());
                seg1.setAvailableSeats(getAvailableSeats(t1Src.getTrain(), journeyDate, t1Src.getStopSequence(),
                                t1End.getStopSequence()));

                SearchResultDTO.SegmentDTO seg2 = new SearchResultDTO.SegmentDTO(
                                t2Start.getTrain().getTrainName(),
                                t2Start.getTrain().getTrainNumber(),
                                t2Start.getStation().getStationCode(),
                                t2End.getStation().getStationCode(),
                                t2Start.getDepartureTime(),
                                t2End.getArrivalTime(),
                                "Destination",
                                t2Start.getTrain().getTrainId(),
                                t2Start.getStation().getStationId(),
                                t2End.getStation().getStationId());
                seg2.setAvailableSeats(getAvailableSeats(t2Start.getTrain(), journeyDate, t2Start.getStopSequence(),
                                t2End.getStopSequence()));

                List<SearchResultDTO.SegmentDTO> segments = new ArrayList<>();
                segments.add(seg1);
                segments.add(seg2);

                // ... path creation
                List<SearchResultDTO.StationPointDTO> path1 = getPath(t1Src.getTrain().getTrainId(),
                                t1Src.getStopSequence(),
                                t1End.getStopSequence(), allSchedules);
                List<SearchResultDTO.StationPointDTO> path2 = getPath(t2Start.getTrain().getTrainId(),
                                t2Start.getStopSequence(), t2End.getStopSequence(), allSchedules);

                List<SearchResultDTO.StationPointDTO> fullPath = new ArrayList<>(path1);
                fullPath.addAll(path2);

                SearchResultDTO dto = new SearchResultDTO(
                                trainName,
                                trainNumber,
                                t1Src.getDepartureTime(),
                                t2End.getArrivalTime(),
                                durationStr,
                                price,
                                false,
                                t1End.getStation().getStationName(),
                                segments,
                                fullPath,
                                null,
                                t1Src.getStation().getStationId(),
                                t2End.getStation().getStationId(),
                                t1Src.getStation().getStationName(),
                                t1Src.getStation().getStationCode(),
                                t2End.getStation().getStationName(),
                                t2End.getStation().getStationCode());

                // Set min availability? or just leave it since segments have it.
                dto.setAvailableSeats(Math.min(seg1.getAvailableSeats(), seg2.getAvailableSeats()));
                return dto;
        }

        private SearchResultDTO createDoubleLayoverDTO(TrainSchedule t1Src, TrainSchedule t1End,
                        TrainSchedule t2Start, TrainSchedule t2End,
                        TrainSchedule t3Start, TrainSchedule t3End,
                        List<TrainSchedule> allSchedules) {

                double dist1 = t1End.getDistanceFromStartKm() - t1Src.getDistanceFromStartKm();
                double dist2 = t2End.getDistanceFromStartKm() - t2Start.getDistanceFromStartKm();
                double dist3 = t3End.getDistanceFromStartKm() - t3Start.getDistanceFromStartKm();

                double price1 = (t1Src.getTrain().getPrice() != null ? t1Src.getTrain().getPrice() : 100.0)
                                + (dist1 * 2.0);
                double price2 = (t2Start.getTrain().getPrice() != null ? t2Start.getTrain().getPrice() : 100.0)
                                + (dist2 * 2.0);
                double price3 = (t3Start.getTrain().getPrice() != null ? t3Start.getTrain().getPrice() : 100.0)
                                + (dist3 * 2.0);

                double price = price1 + price2 + price3;

                Duration duration = Duration.between(t1Src.getDepartureTime(), t3End.getArrivalTime());
                if (duration.isNegative())
                        duration = duration.plusHours(24);

                String durationStr = String.format("%dh %dm", duration.toHours(), duration.toMinutesPart());
                String trainName = t1Src.getTrain().getTrainName() + " \u2192 " + t2Start.getTrain().getTrainName()
                                + "\u2192" + t3Start.getTrain().getTrainName();
                String trainNumber = "Multi-Leg";

                List<SearchResultDTO.SegmentDTO> segments = new ArrayList<>();
                segments.add(new SearchResultDTO.SegmentDTO(
                                t1Src.getTrain().getTrainName(), t1Src.getTrain().getTrainNumber(),
                                t1Src.getStation().getStationCode(), t1End.getStation().getStationCode(),
                                t1Src.getDepartureTime(), t1End.getArrivalTime(),
                                "Layover at " + t1End.getStation().getStationCode(),
                                t1Src.getTrain().getTrainId(), t1Src.getStation().getStationId(),
                                t1End.getStation().getStationId()));
                segments.add(new SearchResultDTO.SegmentDTO(
                                t2Start.getTrain().getTrainName(), t2Start.getTrain().getTrainNumber(),
                                t2Start.getStation().getStationCode(), t2End.getStation().getStationCode(),
                                t2Start.getDepartureTime(), t2End.getArrivalTime(),
                                "Layover at " + t2End.getStation().getStationCode(),
                                t2Start.getTrain().getTrainId(), t2Start.getStation().getStationId(),
                                t2End.getStation().getStationId()));
                segments.add(new SearchResultDTO.SegmentDTO(
                                t3Start.getTrain().getTrainName(), t3Start.getTrain().getTrainNumber(),
                                t3Start.getStation().getStationCode(), t3End.getStation().getStationCode(),
                                t3Start.getDepartureTime(), t3End.getArrivalTime(), "Destination",
                                t3Start.getTrain().getTrainId(), t3Start.getStation().getStationId(),
                                t3End.getStation().getStationId()));

                List<SearchResultDTO.StationPointDTO> path = new ArrayList<>();
                path.addAll(getPath(t1Src.getTrain().getTrainId(), t1Src.getStopSequence(), t1End.getStopSequence(),
                                allSchedules));
                path.addAll(getPath(t2Start.getTrain().getTrainId(), t2Start.getStopSequence(), t2End.getStopSequence(),
                                allSchedules));
                path.addAll(getPath(t3Start.getTrain().getTrainId(), t3Start.getStopSequence(), t3End.getStopSequence(),
                                allSchedules));

                return new SearchResultDTO(
                                trainName, trainNumber, t1Src.getDepartureTime(), t3End.getArrivalTime(),
                                durationStr, price, false,
                                t1End.getStation().getStationName() + ", " + t2End.getStation().getStationName(),
                                segments, path, null,
                                t1Src.getStation().getStationId(), t3End.getStation().getStationId(),
                                t1Src.getStation().getStationName(), t1Src.getStation().getStationCode(),
                                t3End.getStation().getStationName(), t3End.getStation().getStationCode());
        }
}
