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

package com.example.tbs;

import com.example.tbs.dto.BookingRequestDTO;
import com.example.tbs.entity.Station;
import com.example.tbs.entity.Train;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.entity.User;
import com.example.tbs.exception.SeatAlreadyBookedException;
import com.example.tbs.repository.*;
import com.example.tbs.service.BookingService;
import org.junit.jupiter.api.Assertions;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

@SpringBootTest
public class BookingConcurrencyTest {

    @Autowired
    private BookingService bookingService;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TrainRepository trainRepository;

    @Autowired
    private StationRepository stationRepository;

    @Autowired
    private TrainScheduleRepository trainScheduleRepository;

    @Autowired
    private BookedSeatRepository bookedSeatRepository;

    @Test
    public void testConcurrentBookingPreventsDoubleBooking() throws InterruptedException {
        // Setup Data
        String uniqueSuffix = "" + System.currentTimeMillis();

        User user1 = new User();
        user1.setEmail("u1" + uniqueSuffix + "@test.com");
        user1.setPassword("pass");
        user1.setFullName("User One");
        user1.setRole("USER");
        userRepository.save(user1);

        User user2 = new User();
        user2.setEmail("u2" + uniqueSuffix + "@test.com");
        user2.setPassword("pass");
        user2.setFullName("User Two");
        user2.setRole("USER");
        userRepository.save(user2);

        Station s1 = new Station();
        s1.setStationCode("S1" + uniqueSuffix);
        s1.setStationName("Station 1");
        stationRepository.save(s1);

        Station s2 = new Station();
        s2.setStationCode("S2" + uniqueSuffix);
        s2.setStationName("Station 2");
        stationRepository.save(s2);

        Train train = new Train();
        train.setTrainNumber("9999" + uniqueSuffix);
        train.setTrainName("Test Express");
        // Train entity doesn't have source/dest station fields apparently, they are
        // derived from schedule
        train.setTotalSeatsPerCoach(100);
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

        LocalDate journeyDate = LocalDate.now().plusDays(1);
        int seatNum = 1;
        String coach = "S1";

        // Create requests
        BookingRequestDTO req1 = new BookingRequestDTO();
        req1.setUserId(user1.getUserId());
        req1.setTrainId(train.getTrainId());
        req1.setSourceStationId(s1.getStationId());
        req1.setDestStationId(s2.getStationId());
        req1.setJourneyDate(journeyDate);
        req1.setCoachType(coach);
        req1.setSelectedSeats(List.of(seatNum));

        BookingRequestDTO req2 = new BookingRequestDTO();
        req2.setUserId(user2.getUserId());
        req2.setTrainId(train.getTrainId());
        req2.setSourceStationId(s1.getStationId());
        req2.setDestStationId(s2.getStationId());
        req2.setJourneyDate(journeyDate);
        req2.setCoachType(coach);
        req2.setSelectedSeats(List.of(seatNum));

        // Execute concurrent bookings
        ExecutorService executor = Executors.newFixedThreadPool(2);
        CountDownLatch latch = new CountDownLatch(1);

        Future<String> future1 = executor.submit(() -> {
            try {
                latch.await();
                bookingService.createBooking(req1);
                return "SUCCESS";
            } catch (SeatAlreadyBookedException e) {
                return "CONFLICT";
            } catch (Exception e) {
                return "ERROR: " + e.getMessage();
            }
        });

        Future<String> future2 = executor.submit(() -> {
            try {
                latch.await();
                bookingService.createBooking(req2);
                return "SUCCESS";
            } catch (SeatAlreadyBookedException e) {
                return "CONFLICT";
            } catch (Exception e) {
                return "ERROR: " + e.getMessage();
            }
        });

        latch.countDown(); // Start!

        String res1 = "ERROR";
        String res2 = "ERROR";
        try {
            res1 = future1.get(5, TimeUnit.SECONDS);
            res2 = future2.get(5, TimeUnit.SECONDS);
        } catch (Exception e) {
            e.printStackTrace();
        }

        System.out.println("Result 1: " + res1);
        System.out.println("Result 2: " + res2);

        // One should succeed, one should conflict
        boolean oneSuccess = "SUCCESS".equals(res1) || "SUCCESS".equals(res2);
        boolean oneConflict = "CONFLICT".equals(res1) || "CONFLICT".equals(res2);

        Assertions.assertTrue(oneSuccess, "At least one booking should succeed");
        Assertions.assertTrue(oneConflict, "One booking should fail with CONFLICT");

        // Use repo to verify only 1 seat booked
        long count = bookedSeatRepository.countBookedSeats(train.getTrainId(), journeyDate);
        // Note: countBookedSeats counts all seats. user1 booked 1 seat. user2 failed.
        // existing count should be 1.
        // Wait, countBookedSeats query might be wrong in repo if not filtered by seat.
        // But here we created a fresh train.
        Assertions.assertEquals(1, count);
    }
}
