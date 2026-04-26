package com.showbooking.backend.repository;

import com.showbooking.backend.entity.BookingSeat;
import com.showbooking.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface BookingSeatRepository extends JpaRepository<BookingSeat, Long> {
    List<BookingSeat> findByShowTiming_Id(Long showTimingId);
    
    @Query("SELECT bs FROM BookingSeat bs JOIN FETCH bs.booking b WHERE bs.showTiming.id = :showTimingId AND b.status NOT IN :excludedStatuses")
    List<BookingSeat> findActiveBookingsByShowTiming(@Param("showTimingId") Long showTimingId, @Param("excludedStatuses") List<com.showbooking.backend.entity.BookingStatus> excludedStatuses);
    
    List<BookingSeat> findByBooking_Id(Long bookingId);
    boolean existsByShowTiming_IdAndSeat_Id(Long showTimingId, Long seatId);
    boolean existsByShowTiming_Show_Id(Long showId);

    @Query("select count(bs.id) from BookingSeat bs join bs.booking b where b.status = :status")
    long countByBookingStatus(@Param("status") BookingStatus status);

    @Query("select count(bs.id) from BookingSeat bs join bs.booking b where b.status = :status and bs.showTiming.screen.venue.id in :venueIds")
    long countByVenueIdsAndBookingStatus(@Param("venueIds") Collection<Long> venueIds, @Param("status") BookingStatus status);
}
