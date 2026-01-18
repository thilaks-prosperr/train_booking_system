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

import com.example.tbs.dto.BookingRequestDTO;
import com.example.tbs.service.BookingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/seats")
public class AdminSeatController {

    private final BookingService bookingService;

    public AdminSeatController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping("/block")
    public ResponseEntity<?> blockSeats(@RequestBody BookingRequestDTO request) {
        try {
            // Reusing BookingService but we need to ensure the booking is marked as BLOCKED
            // We might need a specific method in BookingService or just pass a flag
            // Actually, let's add a method in BookingService for blocking
            Long bookingId = bookingService.createAdminBlock(request);
            return ResponseEntity.ok(bookingId);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/unblock")
    public ResponseEntity<?> unblockSeats(@RequestBody UnblockRequest request) {
        try {
            bookingService.unblockSeats(request.getTrainId(), request.getJourneyDate(), request.getSeatNumbers(),
                    request.getCoachType());
            return ResponseEntity.ok("Seats unblocked successfully");
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @lombok.Data
    public static class UnblockRequest {
        private Long trainId;
        private java.time.LocalDate journeyDate;
        private List<Integer> seatNumbers;
        private String coachType;
    }
}
