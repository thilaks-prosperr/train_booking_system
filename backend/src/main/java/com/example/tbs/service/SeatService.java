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

            seats.add(new SeatDTO("A" + i, bookedSeatNumbers.contains(baseSeatNum + 1)));
            seats.add(new SeatDTO("B" + i, bookedSeatNumbers.contains(baseSeatNum + 2)));
            seats.add(new SeatDTO("C" + i, bookedSeatNumbers.contains(baseSeatNum + 3)));
            seats.add(new SeatDTO("D" + i, bookedSeatNumbers.contains(baseSeatNum + 4)));

            rows.add(new SeatRowDTO(i, seats));
        }
        return rows;
    }
}
