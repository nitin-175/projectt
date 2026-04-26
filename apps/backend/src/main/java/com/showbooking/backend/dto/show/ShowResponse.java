package com.showbooking.backend.dto.show;

import com.showbooking.backend.dto.venue.VenueSummaryResponse;

import java.util.List;

public record ShowResponse(
    Long id,
    String title,
    String description,
    Integer duration,
    String language,
    String genre,
    String posterUrl,
    List<Long> venueIds,
    List<VenueSummaryResponse> venues,
    List<ShowTimingResponse> timings
) {
}
