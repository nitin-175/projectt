package com.showbooking.backend.repository;

import com.showbooking.backend.entity.Payment;
import com.showbooking.backend.entity.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.Collection;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking_Id(Long bookingId);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = :status")
    BigDecimal sumAmountByStatus(@Param("status") PaymentStatus status);

    @Query("select coalesce(sum(p.amount), 0) from Payment p where p.status = :status and exists (" +
        "select 1 from BookingSeat bs where bs.booking = p.booking and bs.showTiming.screen.venue.id in :venueIds)")
    BigDecimal sumAmountByStatusAndVenueIds(@Param("status") PaymentStatus status, @Param("venueIds") Collection<Long> venueIds);
}
