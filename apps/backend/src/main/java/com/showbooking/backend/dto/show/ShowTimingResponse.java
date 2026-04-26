package com.showbooking.backend.dto.show;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record ShowTimingResponse(
    Long id,
    String screenName,
    Long venueId,
    String venueName,
    String venueCity,
    LocalDateTime startTime,
    BigDecimal price
) {
}
