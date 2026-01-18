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

package com.example.tbs.service;

import com.example.tbs.dto.BookingRequestDTO;
import com.example.tbs.entity.*;
import com.example.tbs.repository.*;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookingService {

        private final BookingRepository bookingRepository;
        private final BookedSeatRepository bookedSeatRepository;
        private final UserRepository userRepository;
        private final TrainRepository trainRepository;
        private final StationRepository stationRepository;
        private final TrainScheduleRepository trainScheduleRepository;

        public BookingService(BookingRepository bookingRepository, BookedSeatRepository bookedSeatRepository,
                        UserRepository userRepository, TrainRepository trainRepository,
                        StationRepository stationRepository, TrainScheduleRepository trainScheduleRepository) {
                this.bookingRepository = bookingRepository;
                this.bookedSeatRepository = bookedSeatRepository;
                this.userRepository = userRepository;
                this.trainRepository = trainRepository;
                this.stationRepository = stationRepository;
                this.trainScheduleRepository = trainScheduleRepository;
        }

        @Transactional
        public Long createBooking(BookingRequestDTO request) {
                // 1. Fetch Entities
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new RuntimeException("User not found"));
                // Lock the train row to prevent concurrent bookings on the same train
                Train train = trainRepository.findByIdWithLock(request.getTrainId())
                                .orElseThrow(() -> new RuntimeException("Train not found"));
                Station source = stationRepository.findById(request.getSourceStationId())
                                .orElseThrow(() -> new RuntimeException("Source Station not found"));
                Station dest = stationRepository.findById(request.getDestStationId())
                                .orElseThrow(() -> new RuntimeException("Destination Station not found"));

                // 2. Fetch Source and Destination Schedules to get Sequences
                TrainSchedule sourceSchedule = trainScheduleRepository.findByTrainAndStation(train, source)
                                .orElseThrow(() -> new RuntimeException("Train schedule not found for source station"));
                TrainSchedule destSchedule = trainScheduleRepository.findByTrainAndStation(train, dest)
                                .orElseThrow(() -> new RuntimeException(
                                                "Train schedule not found for destination station"));

                int sourceSequence = sourceSchedule.getStopSequence();
                int destSequence = destSchedule.getStopSequence();

                if (sourceSequence >= destSequence) {
                        throw new RuntimeException("Invalid route: Source must be before destination");
                }

                // 3. Save the Booking entity
                Booking booking = new Booking();
                booking.setUser(user);
                booking.setTrain(train);
                booking.setJourneyDate(request.getJourneyDate());
                booking.setSourceStation(source);
                booking.setDestStation(dest);
                booking.setBookingStatus("CONFIRMED");

                // Generate PNR: 2 chars + 4 random digits
                String pnr = "TBS" + (1000 + new java.util.Random().nextInt(9000));
                booking.setPnr(pnr);

                // Calculate Price
                double dist = destSchedule.getDistanceFromStartKm() - sourceSchedule.getDistanceFromStartKm();
                double price = dist * 2.0
                                * (request.getSelectedSeats() != null ? request.getSelectedSeats().size() : 1);
                booking.setTotalFare(price);

                Booking savedBooking = bookingRepository.save(booking);

                // 4. Save Booked Seats with Critical Sequence Info
                List<Integer> selectedSeats = request.getSelectedSeats();
                if (selectedSeats != null) {
                        String coachType = request.getCoachType();
                        for (Integer seatNum : selectedSeats) {
                                BookedSeat bookedSeat = new BookedSeat();
                                bookedSeat.setBooking(savedBooking);
                                bookedSeat.setSeatNumber(seatNum);
                                bookedSeat.setCoachType(coachType);

                                // CRITICAL: Set correct sequence range
                                bookedSeat.setFromSeq(sourceSequence);
                                bookedSeat.setToSeq(destSequence);

                                // Check for conflict BEFORE saving
                                long conflictCount = bookedSeatRepository.countOverlappingBookings(
                                                train.getTrainId(),
                                                request.getJourneyDate(),
                                                sourceSequence,
                                                destSequence);

                                // We need to check if *this specific seat* is already booked.
                                // The countOverlappingBookings counts *any* seat, which is not precise enough
                                // for "is THIS seat taken?"
                                // Actually, let's look at BookedSeatRepository.
                                // It has findBookedSeats which takes seq range.
                                // We should filter by seat number.

                                // Let's use a specific query for this seat.
                                List<BookedSeat> conflicts = bookedSeatRepository.findAdminBlockedSeats(
                                                train.getTrainId(),
                                                request.getJourneyDate(),
                                                coachType,
                                                List.of(seatNum));

                                // Filter conflicts to check if they actually overlap in sequence
                                boolean isTaken = conflicts.stream()
                                                .anyMatch(existing -> existing.getFromSeq() < destSequence
                                                                && existing.getToSeq() > sourceSequence);

                                if (isTaken) {
                                        throw new com.example.tbs.exception.SeatAlreadyBookedException(
                                                        "Seat " + seatNum + " is already booked.");
                                }

                                bookedSeatRepository.save(bookedSeat);

                                // 5. Debugging Log
                                System.out.println("Blocked Seat " + seatNum + " from seq " + sourceSequence + " to "
                                                + destSequence);
                        }
                }

                return savedBooking.getBookingId();
        }

        @Transactional
        public Long createAdminBlock(BookingRequestDTO request) {
                // 1. Fetch Entities
                User user = null;
                if (request.getUserId() != null && request.getUserId() > 0) {
                        user = userRepository.findById(request.getUserId()).orElse(null);
                }

                // If user is null, we proceed (assuming DB allows nullable user_id for blocks)
                // If DB enforces Not Null, this will fail at save, but that's better than
                // failing at "User not found" check
                // for a dummy ID.

                Train train = trainRepository.findByIdWithLock(request.getTrainId())
                                .orElseThrow(() -> new RuntimeException("Train not found"));

                Station source;
                Station dest;
                int sourceSequence;
                int destSequence;

                // Auto-detect route if ID is 0 or null (simplifies frontend)
                if (request.getSourceStationId() == null || request.getSourceStationId() <= 0 ||
                                request.getDestStationId() == null || request.getDestStationId() <= 0) {

                        List<TrainSchedule> schedules = trainScheduleRepository.findByTrain(train);
                        if (schedules.isEmpty())
                                throw new RuntimeException("Train has no schedule");

                        // Sort by sequence
                        schedules.sort(java.util.Comparator.comparingInt(TrainSchedule::getStopSequence));

                        TrainSchedule first = schedules.get(0);
                        TrainSchedule last = schedules.get(schedules.size() - 1);

                        source = first.getStation();
                        dest = last.getStation();
                        sourceSequence = first.getStopSequence();
                        destSequence = last.getStopSequence();
                } else {
                        source = stationRepository.findById(request.getSourceStationId())
                                        .orElseThrow(() -> new RuntimeException("Source Station not found"));
                        dest = stationRepository.findById(request.getDestStationId())
                                        .orElseThrow(() -> new RuntimeException("Destination Station not found"));

                        TrainSchedule sourceSchedule = trainScheduleRepository.findByTrainAndStation(train, source)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Train schedule not found for source station"));
                        TrainSchedule destSchedule = trainScheduleRepository.findByTrainAndStation(train, dest)
                                        .orElseThrow(() -> new RuntimeException(
                                                        "Train schedule not found for destination station"));

                        sourceSequence = sourceSchedule.getStopSequence();
                        destSequence = destSchedule.getStopSequence();
                }

                // 2. Save Booking as BLOCKED
                Booking booking = new Booking();
                booking.setUser(user);
                booking.setTrain(train);
                booking.setJourneyDate(request.getJourneyDate());
                booking.setSourceStation(source);
                booking.setDestStation(dest);
                booking.setBookingStatus("BLOCKED");
                booking.setPnr("BLK" + System.currentTimeMillis());
                booking.setTotalFare(0.0);

                Booking savedBooking = bookingRepository.save(booking);

                // 3. Save Booked Seats
                List<Integer> selectedSeats = request.getSelectedSeats();
                if (selectedSeats != null) {
                        for (Integer seatNum : selectedSeats) {
                                BookedSeat bookedSeat = new BookedSeat();
                                bookedSeat.setBooking(savedBooking);
                                bookedSeat.setSeatNumber(seatNum);
                                bookedSeat.setCoachType(request.getCoachType());
                                bookedSeat.setFromSeq(sourceSequence);
                                bookedSeat.setToSeq(destSequence);

                                // Check conflict?
                                // If Admin wants to force block, maybe we don't check?
                                // BUT if a user already booked it, we shouldn't overwrite without warning.
                                // Let's enforce conflict check. Admin should see it's booked and not try to
                                // block.
                                // If they really want to block, they should cancel the user's booking first.
                                long conflictCount = bookedSeatRepository.countOverlappingBookings(
                                                train.getTrainId(),
                                                request.getJourneyDate(),
                                                sourceSequence,
                                                destSequence);

                                List<BookedSeat> conflicts = bookedSeatRepository.findAdminBlockedSeats(
                                                train.getTrainId(),
                                                request.getJourneyDate(),
                                                request.getCoachType(),
                                                List.of(seatNum));

                                boolean isTaken = conflicts.stream()
                                                .anyMatch(existing -> existing.getFromSeq() < destSequence
                                                                && existing.getToSeq() > sourceSequence);

                                if (isTaken) {
                                        throw new RuntimeException("Seat " + seatNum
                                                        + " is already booked/blocked. Cannot block.");
                                }

                                bookedSeatRepository.save(bookedSeat);
                        }
                }
                return savedBooking.getBookingId();
        }

        @Transactional
        public void unblockSeats(Long trainId, java.time.LocalDate journeyDate, List<Integer> seatNumbers,
                        String coachType) {
                // Find seats that are BLOCKED and match the criteria
                List<BookedSeat> seats = bookedSeatRepository.findAdminBlockedSeats(trainId, journeyDate, coachType,
                                seatNumbers);

                // Filter only those that belong to a BLOCKED booking
                List<BookedSeat> seatsToRemove = seats.stream()
                                .filter(s -> "BLOCKED".equalsIgnoreCase(s.getBooking().getBookingStatus()))
                                .collect(java.util.stream.Collectors.toList());

                if (seatsToRemove.isEmpty()) {
                        // Determine if failure or silent success.
                        // Maybe some seats were not blocked?
                        // Let's just return.
                        return;
                }

                bookedSeatRepository.deleteAll(seatsToRemove);

                // Optional: Cleanup empty bookings
                // We can leave them for now or delete if no seats left.
        }

        @Transactional
        public List<Long> createCompositeBooking(com.example.tbs.dto.CompositeBookingRequest compositeRequest) {
                List<Long> bookingIds = new java.util.ArrayList<>();
                for (BookingRequestDTO request : compositeRequest.getBookings()) {
                        bookingIds.add(createBooking(request));
                }
                return bookingIds;
        }

        @Transactional
        public void cancelBooking(Long bookingId) {
                Booking booking = bookingRepository.findById(bookingId)
                                .orElseThrow(() -> new RuntimeException("Booking not found"));

                // 1. Free up the seats (Delete them so others can book)
                // Note: We need a method in Repository or use a custom query.
                // Since we don't have direct deleteByBooking in interface yet, let's fetch and
                // delete.
                // Ideally, add deleteByBooking to Repository for efficiency.
                List<BookedSeat> seats = bookedSeatRepository.findByBooking(booking);
                bookedSeatRepository.deleteAll(seats);

                // 2. Update Status to CANCELLED
                booking.setBookingStatus("CANCELLED");
                bookingRepository.save(booking);
        }

        public java.util.List<BookingHistoryDTO> getUserBookings(Long userId) {
                List<Booking> bookings = bookingRepository.findByUserUserId(userId);

                return bookings.stream().map(b -> {
                        List<BookedSeat> seats = bookedSeatRepository.findByBooking(b);
                        List<BookedSeatDTO> seatDTOs = seats.stream()
                                        .map(s -> new BookedSeatDTO(s.getSeatId(), s.getSeatNumber(), s.getCoachType()))
                                        .collect(java.util.stream.Collectors.toList());

                        return new BookingHistoryDTO(
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
                }).collect(java.util.stream.Collectors.toList());
        }

        @lombok.Data
        @lombok.AllArgsConstructor
        public static class BookingHistoryDTO {
                private Long bookingId;
                private Long userId;
                private Long trainId;
                private java.time.LocalDate journeyDate;
                private Long sourceStationId;
                private Long destStationId;
                private String bookingStatus;

                // Nested objects for Frontend
                private Train train;
                private Station sourceStation;
                private Station destStation;
                private List<BookedSeatDTO> seats;
                private Double totalPrice;
                private String userName;
                private String userEmail;
                private String pnr;
        }

        @lombok.Data
        @lombok.AllArgsConstructor
        public static class BookedSeatDTO {
                private Long seatId;
                private int seatNumber;
                private String coachType;
        }
}
