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

import com.example.tbs.controller.SeatController.SeatDTO;
import com.example.tbs.controller.SeatController.SeatRowDTO;
import com.example.tbs.entity.BookedSeat;
import com.example.tbs.repository.BookedSeatRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class SeatService {

        private final BookedSeatRepository bookedSeatRepository;

        public SeatService(BookedSeatRepository bookedSeatRepository) {
                this.bookedSeatRepository = bookedSeatRepository;
        }

        public List<SeatRowDTO> getSeatLayout(Long trainId, LocalDate date, String coach, int startSeq, int endSeq) {
                // Fetch overlapping bookings
                // Logic: A seat is 'BOOKED' if (UserStart < BookedEnd) AND (UserEnd >
                // BookedStart).
                // The repository query already handles this logic:
                // b.fromSeq < :endSeq AND b.toSeq > :startSeq
                List<BookedSeat> bookedSeats = bookedSeatRepository.findBookedSeats(
                                trainId, date, coach, startSeq, endSeq);

                Set<Integer> bookedSeatNumbers = bookedSeats.stream()
                                .map(BookedSeat::getSeatNumber)
                                .collect(Collectors.toSet());

                List<SeatRowDTO> rows = new ArrayList<>();
                int seatsPerRow = 4;
                int totalRows = 10;

                for (int i = 1; i <= totalRows; i++) {
                        List<SeatDTO> seats = new ArrayList<>();
                        // Seat Numbers logic matches frontend expectation
                        int baseSeatNum = (i - 1) * seatsPerRow;

                        seats.add(new SeatDTO(baseSeatNum + 1, String.valueOf(baseSeatNum + 1),
                                        bookedSeatNumbers.contains(baseSeatNum + 1)));
                        seats.add(new SeatDTO(baseSeatNum + 2, String.valueOf(baseSeatNum + 2),
                                        bookedSeatNumbers.contains(baseSeatNum + 2)));
                        seats.add(new SeatDTO(baseSeatNum + 3, String.valueOf(baseSeatNum + 3),
                                        bookedSeatNumbers.contains(baseSeatNum + 3)));
                        seats.add(new SeatDTO(baseSeatNum + 4, String.valueOf(baseSeatNum + 4),
                                        bookedSeatNumbers.contains(baseSeatNum + 4)));

                        rows.add(new SeatRowDTO(i, seats));
                }
                return rows;
        }
}
