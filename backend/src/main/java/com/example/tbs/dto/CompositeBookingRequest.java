package com.example.tbs.dto;

import lombok.Data;
import java.util.List;

@Data
public class CompositeBookingRequest {
    private List<BookingRequestDTO> bookings;
}
