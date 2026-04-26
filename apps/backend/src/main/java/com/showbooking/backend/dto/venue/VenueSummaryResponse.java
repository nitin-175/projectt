package com.showbooking.backend.dto.venue;

public record VenueSummaryResponse(
    Long id,
    String name,
    String city,
    String address
) {
}
