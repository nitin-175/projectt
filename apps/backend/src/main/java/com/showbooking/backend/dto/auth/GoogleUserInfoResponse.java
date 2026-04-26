package com.showbooking.backend.dto.auth;

import com.fasterxml.jackson.annotation.JsonProperty;

public record GoogleUserInfoResponse(
    String sub,
    String email,
    @JsonProperty("email_verified") Boolean verifiedEmail,
    String name,
    String picture
) {
}
