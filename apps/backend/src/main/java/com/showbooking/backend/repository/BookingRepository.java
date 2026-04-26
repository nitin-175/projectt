package com.showbooking.backend.repository;

import com.showbooking.backend.entity.Booking;
import com.showbooking.backend.entity.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    List<Booking> findByUser_IdOrderByCreatedAtDesc(Long userId);
    long countByStatus(BookingStatus status);
    List<Booking> findTop5ByOrderByCreatedAtDesc();

    @Query("select count(distinct b.id) from Booking b where exists (" +
        "select 1 from BookingSeat bs where bs.booking = b and bs.showTiming.screen.venue.id in :venueIds)")
    long countByVenueIds(@Param("venueIds") Collection<Long> venueIds);

    @Query("select count(distinct b.id) from Booking b where b.status = :status and exists (" +
        "select 1 from BookingSeat bs where bs.booking = b and bs.showTiming.screen.venue.id in :venueIds)")
    long countByVenueIdsAndStatus(@Param("venueIds") Collection<Long> venueIds, @Param("status") BookingStatus status);

    @Query("select count(distinct b.user.id) from Booking b where exists (" +
        "select 1 from BookingSeat bs where bs.booking = b and bs.showTiming.screen.venue.id in :venueIds)")
    long countDistinctCustomersByVenueIds(@Param("venueIds") Collection<Long> venueIds);

    @Query("select distinct b from Booking b where exists (" +
        "select 1 from BookingSeat bs where bs.booking = b and bs.showTiming.screen.venue.id in :venueIds) " +
        "order by b.createdAt desc")
    List<Booking> findRecentByVenueIds(@Param("venueIds") Collection<Long> venueIds, Pageable pageable);

    @Query("select distinct b from Booking b where exists (" +
        "select 1 from BookingSeat bs where bs.booking = b and bs.showTiming.show.id = :showId)")
    List<Booking> findDistinctByShowId(@Param("showId") Long showId);
}
