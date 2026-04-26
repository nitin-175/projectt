package com.showbooking.backend.dto.seat;

public record SeatResponse(
    Long id,
    Long showTimingId,
    String label,
    String status
) {
}
