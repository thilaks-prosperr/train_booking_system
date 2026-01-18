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

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    public ResponseEntity<?> createBooking(@RequestBody BookingRequestDTO request) {
        try {
            Long bookingId = bookingService.createBooking(request);
            return ResponseEntity.ok(bookingId);
        } catch (com.example.tbs.exception.SeatAlreadyBookedException e) {
            return ResponseEntity.status(org.springframework.http.HttpStatus.CONFLICT).body(e.getMessage());
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @PostMapping("/composite")
    public ResponseEntity<?> createCompositeBooking(@RequestBody com.example.tbs.dto.CompositeBookingRequest request) {
        try {
            java.util.List<Long> bookingIds = bookingService.createCompositeBooking(request);
            return ResponseEntity.ok(bookingIds);
        } catch (RuntimeException e) {
            e.printStackTrace();
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<?> getUserBookings(@PathVariable Long userId) {
        return ResponseEntity.ok(bookingService.getUserBookings(userId));
    }

    @DeleteMapping("/{bookingId}")
    public ResponseEntity<?> cancelBooking(@PathVariable Long bookingId) {
        bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok("Booking cancelled successfully");
    }
}
