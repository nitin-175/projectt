package com.showbooking.backend.controller;

import com.showbooking.backend.dto.dashboard.DashboardSummaryResponse;
import com.showbooking.backend.security.SecurityUser;
import com.showbooking.backend.service.DashboardService;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/summary")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public DashboardSummaryResponse getSummary(@AuthenticationPrincipal SecurityUser securityUser) {
        return dashboardService.getSummary(securityUser.getId());
    }
}
