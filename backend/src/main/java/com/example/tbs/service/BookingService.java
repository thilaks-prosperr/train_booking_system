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
                Train train = trainRepository.findById(request.getTrainId())
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

                                bookedSeatRepository.save(bookedSeat);

                                // 5. Debugging Log
                                System.out.println("Blocked Seat " + seatNum + " from seq " + sourceSequence + " to "
                                                + destSequence);
                        }
                }

                return savedBooking.getBookingId();
        }

        public java.util.List<BookingHistoryDTO> getUserBookings(Long userId) {
                return bookingRepository.findByUserUserId(userId).stream().map(b -> new BookingHistoryDTO(
                                b.getBookingId(),
                                b.getTrain().getTrainName(),
                                b.getTrain().getTrainNumber(),
                                b.getSourceStation().getStationName(),
                                b.getDestStation().getStationName(),
                                b.getJourneyDate(),
                                b.getBookingStatus())).collect(java.util.stream.Collectors.toList());
        }

        @lombok.Data
        @lombok.AllArgsConstructor
        public static class BookingHistoryDTO {
                private Long bookingId;
                private String trainName;
                private String trainNumber;
                private String source;
                private String dest;
                private java.time.LocalDate date;
                private String status;
        }
}
