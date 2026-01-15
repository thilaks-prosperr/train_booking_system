package com.example.tbs.repository;

import com.example.tbs.entity.BookedSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

@Repository
public interface BookedSeatRepository extends JpaRepository<BookedSeat, Long> {

        @Query("SELECT b FROM BookedSeat b " +
                        "WHERE b.booking.journeyDate = :journeyDate " +
                        "AND b.booking.train.trainId = :trainId " +
                        "AND b.coachType = :coachType " +
                        "AND b.fromSeq < :endSeq " +
                        "AND b.toSeq > :startSeq")
        List<BookedSeat> findBookedSeats(@Param("trainId") Long trainId,
                        @Param("journeyDate") LocalDate journeyDate,
                        @Param("coachType") String coachType,
                        @Param("startSeq") int startSeq,
                        @Param("endSeq") int endSeq);

        @Query("SELECT COUNT(b) FROM BookedSeat b WHERE b.booking.train.trainId = :trainId AND b.booking.journeyDate = :journeyDate")
        long countBookedSeats(@Param("trainId") Long trainId, @Param("journeyDate") LocalDate journeyDate);

        List<BookedSeat> findByBooking(com.example.tbs.entity.Booking booking);
}
