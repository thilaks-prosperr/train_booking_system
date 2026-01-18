package com.example.tbs;

import com.example.tbs.dto.BookingRequestDTO;
import com.example.tbs.entity.Station;
import com.example.tbs.entity.Train;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.entity.User;
import com.example.tbs.repository.*;
import com.example.tbs.service.BookingService;
import com.example.tbs.service.SeatService;
import com.example.tbs.controller.SeatController.SeatRowDTO;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;

@SpringBootTest
public class AdminSeatTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private SeatService seatService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private TrainScheduleRepository trainScheduleRepository;

    @Test
    public void testAdminBlockAndUnblock() {
        // Setup Data
        String uniqueSuffix = "" + System.currentTimeMillis();

        User user = new User();
        user.setEmail("admin" + uniqueSuffix + "@test.com");
        user.setPassword("pass");
        user.setFullName("Admin User");
        user.setRole("ADMIN");
        userRepository.save(user);

        Station s1 = new Station();
        s1.setStationCode("S1" + uniqueSuffix);
        s1.setStationName("Station 1");
        stationRepository.save(s1);

        Station s2 = new Station();
        s2.setStationCode("S2" + uniqueSuffix);
        s2.setStationName("Station 2");
        stationRepository.save(s2);

        Train train = new Train();
        train.setTrainNumber("8888" + uniqueSuffix);
        train.setTrainName("Admin Test Express");
        train.setTotalSeatsPerCoach(50);
        train.setNumberOfCoaches(1);
        trainRepository.save(train);

        TrainSchedule ts1 = new TrainSchedule();
        ts1.setTrain(train);
        ts1.setStation(s1);
        ts1.setStopSequence(1);
        ts1.setDepartureTime(LocalTime.of(10, 0));
        ts1.setDistanceFromStartKm(0);
        trainScheduleRepository.save(ts1);

        TrainSchedule ts2 = new TrainSchedule();
        ts2.setTrain(train);
        ts2.setStation(s2);
        ts2.setStopSequence(2);
        ts2.setArrivalTime(LocalTime.of(12, 0));
        ts2.setDistanceFromStartKm(100);
        trainScheduleRepository.save(ts2);

        LocalDate date = LocalDate.now().plusDays(5);
        String coach = "S1";
        int seatToBlock = 10;

        // 1. Block Seat 10 (without specifying stations, relying on auto-detect)
        BookingRequestDTO blockRequest = new BookingRequestDTO();
        blockRequest.setUserId(user.getUserId());
        blockRequest.setTrainId(train.getTrainId());
        blockRequest.setJourneyDate(date);
        blockRequest.setCoachType(coach);
        blockRequest.setSelectedSeats(List.of(seatToBlock));

        Long blockBookingId = bookingService.createAdminBlock(blockRequest);
        Assertions.assertNotNull(blockBookingId);

        // 2. Verify Status in Layout
        List<SeatRowDTO> layout = seatService.getSeatLayout(train.getTrainId(), date, coach, 1, 100);
        boolean isBlocked = layout.stream()
                .flatMap(row -> row.seats.stream())
                .anyMatch(s -> s.number.equals(String.valueOf(seatToBlock)) && "blocked".equalsIgnoreCase(s.status));

        Assertions.assertTrue(isBlocked, "Seat should be marked as blocked");

        // 3. Try to book as User
        BookingRequestDTO userRequest = new BookingRequestDTO();
        userRequest.setUserId(user.getUserId());
        userRequest.setTrainId(train.getTrainId());
        userRequest.setJourneyDate(date);
        userRequest.setCoachType(coach);
        userRequest.setSelectedSeats(List.of(seatToBlock));
        userRequest.setSourceStationId(s1.getStationId());
        userRequest.setDestStationId(s2.getStationId());

        boolean bookingFailed = false;
        try {
            bookingService.createBooking(userRequest);
        } catch (Exception e) {
            if (e.getMessage().contains("already booked") || e.getMessage().contains("conflict")) {
                bookingFailed = true;
            }
        }
        Assertions.assertTrue(bookingFailed, "User booking should fail on blocked seat");

        // 4. Unblock
        bookingService.unblockSeats(train.getTrainId(), date, List.of(seatToBlock), coach);

        // 5. Verify Available
        List<SeatRowDTO> layoutAfter = seatService.getSeatLayout(train.getTrainId(), date, coach, 1, 100);
        boolean isAvailable = layoutAfter.stream()
                .flatMap(row -> row.seats.stream())
                .anyMatch(s -> s.number.equals(String.valueOf(seatToBlock)) && "available".equalsIgnoreCase(s.status));

        Assertions.assertTrue(isAvailable, "Seat should be available after unblock");
    }
}
