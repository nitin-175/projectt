package com.showbooking.backend.dto.booking;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public record BookingResponse(
    Long id,
    Long userId,
    BigDecimal totalAmount,
    String status,
    LocalDateTime createdAt,
    Long showTimingId,
    String showTitle,
    List<Long> seatIds,
    List<String> seatNumbers,
    String paymentStatus,
    String transactionId,
    String paymentMethod
) {
}
