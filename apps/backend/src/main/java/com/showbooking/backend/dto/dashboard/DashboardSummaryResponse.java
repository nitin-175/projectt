package com.showbooking.backend.dto.dashboard;

import java.math.BigDecimal;
import java.util.List;

public record DashboardSummaryResponse(
    String scope,
    long registeredUsers,
    long activeOrganizers,
    long trackedCustomers,
    long venueCount,
    long showCount,
    long upcomingScheduleCount,
    long totalBookings,
    long confirmedBookings,
    long pendingBookings,
    long soldSeatCount,
    BigDecimal totalRevenue,
    List<DashboardRecentBookingResponse> recentBookings
) {
}
