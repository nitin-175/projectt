package com.showbooking.backend.repository;

import com.showbooking.backend.entity.Seat;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByScreen_IdOrderBySeatRowAscSeatNumberAsc(Long screenId);
}
