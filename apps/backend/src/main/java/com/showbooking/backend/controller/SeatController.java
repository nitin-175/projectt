package com.showbooking.backend.controller;

import com.showbooking.backend.dto.seat.SeatResponse;
import com.showbooking.backend.service.SeatService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/seats")
public class SeatController {

    private final SeatService seatService;

    public SeatController(SeatService seatService) {
        this.seatService = seatService;
    }

    @GetMapping
    public List<SeatResponse> getSeats(@RequestParam("showTimingId") Long showTimingId) {
        return seatService.getSeatsByShowTiming(showTimingId);
    }
}
