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

@Service
public class SeatService {

        private final BookedSeatRepository bookedSeatRepository;

        public SeatService(BookedSeatRepository bookedSeatRepository) {
                this.bookedSeatRepository = bookedSeatRepository;
        }

        public List<SeatRowDTO> getSeatLayout(Long trainId, LocalDate date, String coach, int startSeq, int endSeq) {
                // Fetch overlapping bookings
                List<BookedSeat> bookedSeats = bookedSeatRepository.findBookedSeats(
                                trainId, date, coach, startSeq, endSeq);

                // Create a map of SeatNumber -> Status
                // If multiple bookings overlap (shouldn't happen conceptually due to locks, but
                // physically possible), priority: BLOCKED > BOOKED
                java.util.Map<Integer, String> seatStatusMap = new java.util.HashMap<>();

                for (BookedSeat bs : bookedSeats) {
                        String status = "booked";
                        if (bs.getBooking() != null && "BLOCKED".equalsIgnoreCase(bs.getBooking().getBookingStatus())) {
                                status = "blocked";
                        }

                        // If already blocked, don't overwrite with booked
                        if (!"blocked".equals(seatStatusMap.get(bs.getSeatNumber()))) {
                                seatStatusMap.put(bs.getSeatNumber(), status);
                        }
                }

                List<SeatRowDTO> rows = new ArrayList<>();
                int seatsPerRow = 4;
                int totalRows = 10;

                for (int i = 1; i <= totalRows; i++) {
                        List<SeatDTO> seats = new ArrayList<>();
                        int baseSeatNum = (i - 1) * seatsPerRow;

                        for (int j = 1; j <= 4; j++) {
                                int seatNum = baseSeatNum + j;
                                String status = seatStatusMap.getOrDefault(seatNum, "available");
                                seats.add(new SeatDTO(seatNum, String.valueOf(seatNum), status));
                        }
                        rows.add(new SeatRowDTO(i, seats));
                }
                return rows;
        }
}
