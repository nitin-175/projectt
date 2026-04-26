package com.showbooking.backend.dto.user;

import com.showbooking.backend.dto.venue.VenueSummaryResponse;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserSummaryResponse {
    private Long id;
    private String name;
    private String email;
    private List<String> roles;
    private List<VenueSummaryResponse> organizerVenues;
    private LocalDateTime createdAt;
}
