package com.example.tbs.controller;

import com.example.tbs.entity.Train;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.repository.BookedSeatRepository;
import com.example.tbs.repository.TrainRepository;
import com.example.tbs.repository.TrainScheduleRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final TrainRepository trainRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final BookedSeatRepository bookedSeatRepository;
    private final com.example.tbs.repository.UserRepository userRepository;
    private final com.example.tbs.repository.BookingRepository bookingRepository;
    private final com.example.tbs.repository.StationRepository stationRepository;

    public AdminController(TrainRepository trainRepository, TrainScheduleRepository trainScheduleRepository,
            BookedSeatRepository bookedSeatRepository, com.example.tbs.repository.UserRepository userRepository,
            com.example.tbs.repository.BookingRepository bookingRepository,
            com.example.tbs.repository.StationRepository stationRepository) {
        this.trainRepository = trainRepository;
        this.trainScheduleRepository = trainScheduleRepository;
        this.bookedSeatRepository = bookedSeatRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.stationRepository = stationRepository;
    }

    // --- Stations ---
    @PostMapping("/stations")
    public com.example.tbs.entity.Station saveStation(@RequestBody com.example.tbs.entity.Station station) {
        return stationRepository.save(station);
    }

    // --- Trains ---
    @GetMapping("/trains")
    public List<Train> getAllTrains() {
        return trainRepository.findAll();
    }

    @PostMapping("/trains")
    public Train saveTrain(@RequestBody Train train) {
        return trainRepository.save(train);
    }

    // --- Schedules ---
    @GetMapping("/schedules")
    public List<TrainSchedule> getAllSchedules() {
        return trainScheduleRepository.findAll();
    }

    @PostMapping("/schedules")
    public TrainSchedule saveSchedule(@RequestBody TrainSchedule schedule) {
        // Note: For a real app, we'd need to resolve Train and Station entities by ID
        // if they are passed as partial objects.
        // Assuming the frontend/client sends the full object or backend JPA handles the
        // ID ref reference.
        return trainScheduleRepository.save(schedule);
    }

    // --- Seats ---
    // Simple endpoint to clear all booked seats (for easy testing/reset)
    @DeleteMapping("/seats")
    public String clearAllSeats() {
        bookedSeatRepository.deleteAll();
        return "All booked seats have been cleared.";
    }

    @PostMapping("/seats/block")
    public String blockSeats(@RequestBody BlockSeatsRequest request) {
        // Create a dummy Booking for Admin Block
        com.example.tbs.entity.Booking booking = new com.example.tbs.entity.Booking();
        // We need a dummy user or just set null if allowed.
        // Or find the first user.
        booking.setUser(userRepository.findById(1L).orElse(null)); // Using seed user for now
        booking.setTrain(trainRepository.findById(request.trainId).orElseThrow());
        booking.setJourneyDate(request.date);
        booking.setBookingStatus("ADMIN_BLOCK");

        // Block entire route (0 to 100 seq) or specific?
        // Request didn't specify segment, so blocking ENTIRE train route is safest for
        // Admin Block.
        // But BookedSeat needs source/dest stations.
        // We'll assume full route block: 1 to 100.
        booking.setSourceStation(null); // Optional in DB?
        booking.setDestStation(null);

        com.example.tbs.entity.Booking saved = bookingRepository.save(booking);

        for (Integer seatNum : request.seatNumbers) {
            com.example.tbs.entity.BookedSeat seat = new com.example.tbs.entity.BookedSeat();
            seat.setBooking(saved);
            seat.setSeatNumber(seatNum);
            seat.setCoachType(request.coach);
            seat.setFromSeq(0); // Sequence 0
            seat.setToSeq(100); // Sequence 100 (Cover all)
            bookedSeatRepository.save(seat);
        }
        return "Seats blocked successfully";
    }

    public static class BlockSeatsRequest {
        public Long trainId;
        public java.time.LocalDate date;
        public String coach;
        public List<Integer> seatNumbers;
    }

    // --- Bookings Management ---
    @GetMapping("/bookings")
    public List<com.example.tbs.service.BookingService.BookingHistoryDTO> getAllBookings() {
        return bookingRepository.findAll().stream()
                .map(b -> new com.example.tbs.service.BookingService.BookingHistoryDTO(
                        b.getBookingId(),
                        b.getTrain().getTrainName(),
                        b.getTrain().getTrainNumber(),
                        b.getSourceStation().getStationName(),
                        b.getDestStation().getStationName(),
                        b.getJourneyDate(),
                        b.getBookingStatus()))
                .toList();
    }

    // --- Stats ---
    // --- Stats ---
    @GetMapping("/stats")
    public java.util.Map<String, Object> getStats() {
        long userCount = userRepository.count();
        long bookingCount = bookingRepository.count();
        // Assuming revenue is fixed for now or needs price calculation
        // Since we don't have price yet, we can't calculate revenue accurately.
        // We will return 0 or a placeholder.
        double revenue = 0.0;

        long trainCount = trainRepository.count();
        long stationCount = stationRepository.count();

        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("users", userCount);
        stats.put("bookings", bookingCount);
        stats.put("trains", trainCount);
        stats.put("stations", stationCount);
        stats.put("revenue", revenue);
        return stats;
    }

    @GetMapping("/occupancy")
    public java.util.Map<String, Object> getOccupancy(@RequestParam Long trainId,
            @RequestParam @org.springframework.format.annotation.DateTimeFormat(iso = org.springframework.format.annotation.DateTimeFormat.ISO.DATE) java.time.LocalDate date) {
        Train train = trainRepository.findById(trainId).orElseThrow();
        int totalSeats = train.getTotalSeatsPerCoach() * 10; // Assuming 10 coaches for calculation
        long bookedCount = bookedSeatRepository.countBookedSeats(trainId, date);
        double occupancyPercentage = (double) bookedCount / totalSeats * 100;

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalSeats", totalSeats);
        result.put("bookedCount", bookedCount);
        result.put("occupancyPercentage", occupancyPercentage);
        return result;
    }
}
