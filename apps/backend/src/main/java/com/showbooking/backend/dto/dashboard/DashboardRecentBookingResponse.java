package com.showbooking.backend.dto.dashboard;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record DashboardRecentBookingResponse(
    Long bookingId,
    String customerName,
    String showTitle,
    String bookingStatus,
    String paymentStatus,
    BigDecimal totalAmount,
    LocalDateTime createdAt
) {
}
