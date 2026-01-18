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

package com.example.tbs.controller;

import com.example.tbs.entity.*;
import com.example.tbs.repository.*;
import com.example.tbs.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TrainRepository trainRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final BookedSeatRepository bookedSeatRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final StationRepository stationRepository;
    private final BookingService bookingService;

    public AdminController(TrainRepository trainRepository, TrainScheduleRepository trainScheduleRepository,
            BookedSeatRepository bookedSeatRepository, UserRepository userRepository,
            BookingRepository bookingRepository, StationRepository stationRepository,
            BookingService bookingService) {
        this.trainRepository = trainRepository;
        this.trainScheduleRepository = trainScheduleRepository;
        this.bookedSeatRepository = bookedSeatRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.stationRepository = stationRepository;
        this.bookingService = bookingService;
    }

    // ==========================================
    // 1. Station Management
    // ==========================================

    @PostMapping("/stations")
    public ResponseEntity<Station> createStation(@RequestBody Station station) {
        return ResponseEntity.ok(stationRepository.save(station));
    }

    @PutMapping("/stations/{id}")
    public ResponseEntity<Station> updateStation(@PathVariable Long id, @RequestBody Station stationDetails) {
        Station station = stationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Station not found"));

        station.setStationCode(stationDetails.getStationCode());
        station.setStationName(stationDetails.getStationName());
        station.setCity(stationDetails.getCity());
        station.setLatitude(stationDetails.getLatitude());
        station.setLongitude(stationDetails.getLongitude());

        return ResponseEntity.ok(stationRepository.save(station));
    }

    @DeleteMapping("/stations/{id}")
    public ResponseEntity<?> deleteStation(@PathVariable Long id) {
        stationRepository.deleteById(id);
        return ResponseEntity.ok("Station deleted successfully");
    }

    // ==========================================
    // 2. Train Management
    // ==========================================

    @GetMapping("/trains")
    public ResponseEntity<List<Train>> getAllTrains() {
        return ResponseEntity.ok(trainRepository.findAll());
    }

    @PostMapping("/trains")
    public ResponseEntity<Train> createTrain(@RequestBody Train train) {
        return ResponseEntity.ok(trainRepository.save(train));
    }

    @PutMapping("/trains/{id}")
    public ResponseEntity<Train> updateTrain(@PathVariable Long id, @RequestBody Train trainDetails) {
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));

        train.setTrainNumber(trainDetails.getTrainNumber());
        train.setTrainName(trainDetails.getTrainName());
        train.setTotalSeatsPerCoach(trainDetails.getTotalSeatsPerCoach());
        train.setNumberOfCoaches(trainDetails.getNumberOfCoaches());
        if (trainDetails.getPrice() != null) {
            train.setPrice(trainDetails.getPrice());
        }

        return ResponseEntity.ok(trainRepository.save(train));
    }

    @DeleteMapping("/trains/{id}")
    public ResponseEntity<?> deleteTrain(@PathVariable Long id) {
        trainRepository.deleteById(id);
        return ResponseEntity.ok("Train deleted successfully");
    }

    @PostMapping("/trains/{id}/schedule")
    public ResponseEntity<TrainSchedule> addSchedule(@PathVariable Long id, @RequestBody TrainSchedule schedule) {
        // Ensure train exists
        Train train = trainRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Train not found"));
        schedule.setTrain(train);

        // Fetch the full station object to get coordinates
        Station currentStation = stationRepository.findById(schedule.getStation().getStationId())
                .orElseThrow(() -> new RuntimeException("Station not found"));
        schedule.setStation(currentStation);

        // Auto-calculate distance if not provided or 0
        if (schedule.getDistanceFromStartKm() == 0) {
            List<TrainSchedule> existingSchedules = trainScheduleRepository.findByTrain(train);

            if (existingSchedules.isEmpty()) {
                schedule.setDistanceFromStartKm(0);
            } else {
                // Find the schedule with the highest stopSequence
                TrainSchedule lastStop = existingSchedules.stream()
                        .max(java.util.Comparator.comparingInt(TrainSchedule::getStopSequence))
                        .orElseThrow(); // Should not happen given isEmpty check

                double distFromPrev = calculateHaversineDistance(
                        lastStop.getStation().getLatitude(), lastStop.getStation().getLongitude(),
                        currentStation.getLatitude(), currentStation.getLongitude());

                schedule.setDistanceFromStartKm(lastStop.getDistanceFromStartKm() + (int) Math.round(distFromPrev));
            }
        }

        return ResponseEntity.ok(trainScheduleRepository.save(schedule));
    }

    private double calculateHaversineDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // Earth radius in km
        double latDistance = Math.toRadians(lat2 - lat1);
        double lonDistance = Math.toRadians(lon2 - lon1);
        double a = Math.sin(latDistance / 2) * Math.sin(latDistance / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(lonDistance / 2) * Math.sin(lonDistance / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }

    // Legacy method for retrieving all
    @GetMapping("/schedules")
    public ResponseEntity<List<TrainSchedule>> getAllSchedules() {
        return ResponseEntity.ok(trainScheduleRepository.findAll());
    }

    // ==========================================
    // 3. Booking Operations
    // ==========================================

    @GetMapping("/bookings")
    public ResponseEntity<List<BookingService.BookingHistoryDTO>> getAllBookings() {
        List<BookingService.BookingHistoryDTO> dtos = bookingRepository.findAll().stream()
                .map(b -> {
                    List<BookedSeat> seats = bookedSeatRepository.findByBooking(b);
                    List<BookingService.BookedSeatDTO> seatDTOs = seats.stream()
                            .map(s -> new BookingService.BookedSeatDTO(s.getSeatId(), s.getSeatNumber(),
                                    s.getCoachType()))
                            .collect(java.util.stream.Collectors.toList());

                    return new BookingService.BookingHistoryDTO(
                            b.getBookingId(),
                            b.getUser().getUserId(),
                            b.getTrain().getTrainId(),
                            b.getJourneyDate(),

                            b.getSourceStation() != null ? b.getSourceStation().getStationId() : null,
                            b.getDestStation() != null ? b.getDestStation().getStationId() : null,
                            b.getBookingStatus(),
                            b.getTrain(),
                            b.getSourceStation(),
                            b.getDestStation(),
                            seatDTOs,
                            b.getTotalFare() != null ? b.getTotalFare() : 0.0,
                            b.getUser().getFullName(),
                            b.getUser().getEmail(),
                            b.getPnr());
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @GetMapping("/bookings/{id}")
    public ResponseEntity<Booking> getBookingDetails(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
        return ResponseEntity.ok(booking);
    }

    @PutMapping("/bookings/{id}")
    public ResponseEntity<Booking> updateBooking(@PathVariable Long id, @RequestBody Booking bookingDetails) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        // Allow updating date, or status manually
        if (bookingDetails.getJourneyDate() != null)
            booking.setJourneyDate(bookingDetails.getJourneyDate());
        if (bookingDetails.getBookingStatus() != null)
            booking.setBookingStatus(bookingDetails.getBookingStatus());

        return ResponseEntity.ok(bookingRepository.save(booking));
    }

    @PutMapping("/bookings/{id}/cancel")
    public ResponseEntity<?> cancelBooking(@PathVariable Long id) {
        bookingService.cancelBooking(id); // Use the service logic which correctly frees seats
        return ResponseEntity.ok("Booking cancelled by Admin");
    }

    @PutMapping("/bookings/{id}/refund")
    public ResponseEntity<?> refundBooking(@PathVariable Long id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setBookingStatus("REFUNDED");
        // Should also free seats if not already done?
        // Ideally reuse cancel logic but set specific status
        List<BookedSeat> seats = bookedSeatRepository.findByBooking(booking);
        bookedSeatRepository.deleteAll(seats);

        bookingRepository.save(booking);
        return ResponseEntity.ok("Booking Refunded");
    }

    // ==========================================
    // 4. Seat Operations
    // ==========================================

    @PostMapping("/seats/block")
    public ResponseEntity<String> blockSeats(@RequestBody BlockSeatsRequest request) {
        Booking booking = new Booking();
        // Bind to a dummy or admin user
        booking.setUser(userRepository.findById(1L).orElse(null));
        booking.setTrain(trainRepository.findById(request.trainId).orElseThrow());
        booking.setJourneyDate(request.date);
        booking.setBookingStatus("ADMIN_BLOCK");

        // Full route block by default for Maintenance
        booking.setSourceStation(null);
        booking.setDestStation(null);

        Booking saved = bookingRepository.save(booking);

        for (Integer seatNum : request.seatNumbers) {
            BookedSeat seat = new BookedSeat();
            seat.setBooking(saved);
            seat.setSeatNumber(seatNum);
            seat.setCoachType(request.coach);
            seat.setFromSeq(0);
            seat.setToSeq(100);
            bookedSeatRepository.save(seat);
        }
        return ResponseEntity.ok("Seats blocked successfully");
    }

    @DeleteMapping("/seats/block")
    public ResponseEntity<String> unblockSeats(@RequestBody BlockSeatsRequest request) {
        List<BookedSeat> blockedSeats = bookedSeatRepository.findAdminBlockedSeats(
                request.trainId, request.date, request.coach, request.seatNumbers);

        if (blockedSeats.isEmpty()) {
            return ResponseEntity.badRequest().body("No matching blocked seats found");
        }

        bookedSeatRepository.deleteAll(blockedSeats);
        // Clean up empty ADMIN_BLOCK bookings? optional.

        return ResponseEntity.ok("Seats unblocked successfully");
    }

    // --- Stats ---
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        long userCount = userRepository.count();
        long bookingCount = bookingRepository.count();
        long trainCount = trainRepository.count();
        long stationCount = stationRepository.count();

        // Calculate Revenue from CONFIRMED bookings
        double revenue = bookingRepository.findAll().stream()
                .filter(b -> "CONFIRMED".equals(b.getBookingStatus()) && b.getTotalFare() != null)
                .mapToDouble(Booking::getTotalFare)
                .sum();

        // Calculate Active Trains (trains with schedules)
        long activeTrains = trainRepository.findAll().stream()
                .filter(t -> !trainScheduleRepository.findByTrain(t).isEmpty())
                .count();

        // Calculate Global Occupancy (Rough estimate: Booked Seats / (Total Capacity *
        // 30 days))
        // Or just Total Booked Seats for now as a simple metric check
        long totalBookedSeats = bookedSeatRepository.count();
        long totalCapacity = trainRepository.findAll().stream().mapToLong(t -> t.getTotalSeatsPerCoach() * 10L).sum();

        // Avoid division by zero
        double occupancyPercentage = 0;
        if (totalCapacity > 0) {
            // This is cumulitive occupancy, which might be high/low depending on data.
            // Let's normalize it slightly: (Booked / (Capacity * Active Days?))
            // For simplicity in this demo: (Booked Seats / Capacity) %
            // Ideally this should be per train per day, but global stats are aggregate.
            occupancyPercentage = ((double) totalBookedSeats / (totalCapacity * 10)) * 100; // Assume 10 days capacity
            if (occupancyPercentage > 100)
                occupancyPercentage = 100;
        }

        Map<String, Object> stats = new HashMap<>();
        stats.put("users", userCount);
        stats.put("totalBookings", bookingCount);
        stats.put("activeTrains", activeTrains);
        stats.put("stations", stationCount);
        stats.put("totalRevenue", revenue);
        stats.put("occupancyPercentage", (int) occupancyPercentage);

        return ResponseEntity.ok(stats);
    }

    @GetMapping("/occupancy")
    public ResponseEntity<Map<String, Object>> getOccupancy(@RequestParam Long trainId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        Train train = trainRepository.findById(trainId).orElseThrow();
        int totalSeats = train.getTotalSeatsPerCoach() * 10;
        long bookedCount = bookedSeatRepository.countBookedSeats(trainId, date);
        double occupancyPercentage = (double) bookedCount / totalSeats * 100;

        Map<String, Object> result = new HashMap<>();
        result.put("totalSeats", totalSeats);
        result.put("bookedCount", bookedCount);
        result.put("occupancyPercentage", occupancyPercentage);
        return ResponseEntity.ok(result);
    }

    public static class BlockSeatsRequest {
        public Long trainId;
        public LocalDate date;
        public String coach;
        public List<Integer> seatNumbers;
    }
}
