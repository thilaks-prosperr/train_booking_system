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

        // If station ID is provided in the nested object, ensure it's loaded?
        // JPA usually handles ID ref if properly set.
        // Just saving should work if the frontend sends { station: { stationId: 1 } }

        return ResponseEntity.ok(trainScheduleRepository.save(schedule));
    }

    // Legacy method for retrieving all
    @GetMapping("/schedules")
    public ResponseEntity<List<TrainSchedule>> getAllSchedules() {
        return ResponseEntity.ok(trainScheduleRepository.findAll());
    }

    // ==========================================
    // 3. Booking Operations
    // ==========================================

    @Autowired
    private BookedSeatRepository bookedSeatRepository;

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
                            b.getSourceStation().getStationId(),
                            b.getDestStation().getStationId(),
                            b.getBookingStatus(),
                            b.getTrain(),
                            b.getSourceStation(),
                            b.getDestStation(),
                            seatDTOs,
                            b.getTrain().getTotalSeatsPerCoach() * 10.0 // Dummy price
                    );
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
        double revenue = 0.0;
        long trainCount = trainRepository.count();
        long stationCount = stationRepository.count();

        Map<String, Object> stats = new HashMap<>();
        stats.put("users", userCount);
        stats.put("bookings", bookingCount);
        stats.put("trains", trainCount);
        stats.put("stations", stationCount);
        stats.put("revenue", revenue);
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
