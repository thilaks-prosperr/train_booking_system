/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.controller;

import com.example.tbs.entity.BookedSeat;
import com.example.tbs.repository.BookedSeatRepository;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final com.example.tbs.service.SeatService seatService;

    public SeatController(com.example.tbs.service.SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public List<SeatRowDTO> getSeatLayout(
            @RequestParam Long trainId,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "S1") String coach,
            @RequestParam(defaultValue = "1") int startSeq,
            @RequestParam(defaultValue = "10") int endSeq) {
        return seatService.getSeatLayout(trainId, date, coach, startSeq, endSeq);
    }

    public static class SeatRowDTO {
        public int rowNumber;
        public List<SeatDTO> seats;

        public SeatRowDTO(int rowNumber, List<SeatDTO> seats) {
            this.rowNumber = rowNumber;
            this.seats = seats;
        }
    }

    public static class SeatDTO {
        public int id;
        public String number;
        public boolean isBooked;

        public SeatDTO(int id, String number, boolean isBooked) {
            this.id = id;
            this.number = number;
            this.isBooked = isBooked;
        }
    }
}
