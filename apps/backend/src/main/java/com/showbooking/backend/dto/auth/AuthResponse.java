package com.showbooking.backend.dto.auth;

import java.util.List;

public record AuthResponse(
    String token,
    String name,
    String email,
    List<String> roles,
    List<Long> venueIds
) {
}
