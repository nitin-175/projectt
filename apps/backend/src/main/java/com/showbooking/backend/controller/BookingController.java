package com.showbooking.backend.controller;

import com.showbooking.backend.dto.booking.BookingRequest;
import com.showbooking.backend.dto.booking.BookingResponse;
import com.showbooking.backend.security.SecurityUser;
import com.showbooking.backend.service.BookingService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
public class BookingController {

    private final BookingService bookingService;

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse createBooking(
        @AuthenticationPrincipal SecurityUser securityUser,
        @Valid @RequestBody BookingRequest request
    ) {
        return bookingService.createBooking(securityUser.getId(), request);
    }

    @GetMapping("/user")
    @PreAuthorize("isAuthenticated()")
    public List<BookingResponse> getUserBookings(@AuthenticationPrincipal SecurityUser securityUser) {
        return bookingService.getUserBookings(securityUser.getId());
    }
}
