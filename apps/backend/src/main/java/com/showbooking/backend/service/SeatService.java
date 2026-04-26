package com.showbooking.backend.service;

import com.showbooking.backend.dto.seat.SeatResponse;
import com.showbooking.backend.entity.SeatAvailabilityStatus;
import com.showbooking.backend.entity.ShowTiming;
import com.showbooking.backend.repository.BookingSeatRepository;
import com.showbooking.backend.repository.SeatRepository;
import com.showbooking.backend.repository.ShowTimingRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;

@Service
public class SeatService {

    private final ShowTimingRepository showTimingRepository;
    private final SeatRepository seatRepository;
    private final BookingSeatRepository bookingSeatRepository;

    public SeatService(
        ShowTimingRepository showTimingRepository,
        SeatRepository seatRepository,
        BookingSeatRepository bookingSeatRepository
    ) {
        this.showTimingRepository = showTimingRepository;
        this.seatRepository = seatRepository;
        this.bookingSeatRepository = bookingSeatRepository;
    }

    @Transactional(readOnly = true)
    public List<SeatResponse> getSeatsByShowTiming(Long showTimingId) {
        ShowTiming showTiming = showTimingRepository.findById(showTimingId)
            .orElseThrow(() -> new EntityNotFoundException("Show timing not found: " + showTimingId));

        List<com.showbooking.backend.entity.BookingStatus> excludedStatuses = java.util.Arrays.asList(
            com.showbooking.backend.entity.BookingStatus.FAILED,
            com.showbooking.backend.entity.BookingStatus.CANCELLED
        );
        Set<Long> bookedSeatIds = bookingSeatRepository.findActiveBookingsByShowTiming(showTimingId, excludedStatuses).stream()
            .map(bookingSeat -> bookingSeat.getSeat().getId())
            .collect(java.util.stream.Collectors.toSet());

        return seatRepository.findByScreen_IdOrderBySeatRowAscSeatNumberAsc(showTiming.getScreen().getId()).stream()
            .map(seat -> new SeatResponse(
                seat.getId(),
                showTimingId,
                seat.getLabel(),
                bookedSeatIds.contains(seat.getId()) ? SeatAvailabilityStatus.BOOKED.name() : SeatAvailabilityStatus.AVAILABLE.name()
            ))
            .toList();
    }
}
