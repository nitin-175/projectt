package com.showbooking.backend.service;

import com.showbooking.backend.dto.dashboard.DashboardRecentBookingResponse;
import com.showbooking.backend.dto.dashboard.DashboardSummaryResponse;
import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Booking;
import com.showbooking.backend.entity.BookingSeat;
import com.showbooking.backend.entity.BookingStatus;
import com.showbooking.backend.entity.Payment;
import com.showbooking.backend.entity.PaymentStatus;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.BookingRepository;
import com.showbooking.backend.repository.BookingSeatRepository;
import com.showbooking.backend.repository.PaymentRepository;
import com.showbooking.backend.repository.ShowRepository;
import com.showbooking.backend.repository.ShowTimingRepository;
import com.showbooking.backend.repository.UserRepository;
import com.showbooking.backend.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final VenueRepository venueRepository;
    private final ShowRepository showRepository;
    private final ShowTimingRepository showTimingRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
        UserRepository userRepository,
        VenueRepository venueRepository,
        ShowRepository showRepository,
        ShowTimingRepository showTimingRepository,
        BookingRepository bookingRepository,
        BookingSeatRepository bookingSeatRepository,
        PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.venueRepository = venueRepository;
        this.showRepository = showRepository;
        this.showTimingRepository = showTimingRepository;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getSummary(Long userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (hasRole(user, AppRole.ADMIN)) {
            return buildAdminSummary();
        }
        if (hasRole(user, AppRole.ORGANIZER)) {
            return buildOrganizerSummary(user);
        }

        throw new IllegalArgumentException("Dashboard is available only for admin and organizer accounts");
    }

    private DashboardSummaryResponse buildAdminSummary() {
        List<Long> venueIds = venueRepository.findAll().stream()
            .map(Venue::getId)
            .toList();

        return new DashboardSummaryResponse(
            "ADMIN",
            userRepository.count(),
            userRepository.countByRoleName(AppRole.ORGANIZER),
            venueIds.isEmpty() ? 0 : bookingRepository.countDistinctCustomersByVenueIds(venueIds),
            venueRepository.count(),
            showRepository.count(),
            showTimingRepository.countByStartTimeAfter(LocalDateTime.now()),
            bookingRepository.count(),
            bookingRepository.countByStatus(BookingStatus.CONFIRMED),
            bookingRepository.countByStatus(BookingStatus.PENDING_PAYMENT),
            bookingSeatRepository.countByBookingStatus(BookingStatus.CONFIRMED),
            defaultIfNull(paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS)),
            bookingRepository.findTop5ByOrderByCreatedAtDesc().stream()
                .map(this::mapRecentBooking)
                .toList()
        );
    }

    private DashboardSummaryResponse buildOrganizerSummary(User user) {
        Set<Long> venueIds = user.getVenues().stream()
            .map(Venue::getId)
            .collect(Collectors.toSet());

        if (venueIds.isEmpty()) {
            return new DashboardSummaryResponse(
                "ORGANIZER",
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                0,
                BigDecimal.ZERO,
                Collections.emptyList()
            );
        }

        return new DashboardSummaryResponse(
            "ORGANIZER",
            0,
            0,
            bookingRepository.countDistinctCustomersByVenueIds(venueIds),
            venueIds.size(),
            showRepository.countDistinctByVenueIds(venueIds),
            showTimingRepository.countUpcomingByVenueIds(venueIds, LocalDateTime.now()),
            bookingRepository.countByVenueIds(venueIds),
            bookingRepository.countByVenueIdsAndStatus(venueIds, BookingStatus.CONFIRMED),
            bookingRepository.countByVenueIdsAndStatus(venueIds, BookingStatus.PENDING_PAYMENT),
            bookingSeatRepository.countByVenueIdsAndBookingStatus(venueIds, BookingStatus.CONFIRMED),
            defaultIfNull(paymentRepository.sumAmountByStatusAndVenueIds(PaymentStatus.SUCCESS, venueIds)),
            bookingRepository.findRecentByVenueIds(venueIds, PageRequest.of(0, 5)).stream()
                .map(this::mapRecentBooking)
                .toList()
        );
    }

    private DashboardRecentBookingResponse mapRecentBooking(Booking booking) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBooking_Id(booking.getId());
        String showTitle = bookingSeats.stream()
            .findFirst()
            .map(bookingSeat -> bookingSeat.getShowTiming().getShow().getTitle())
            .orElse("Unknown Show");
        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElse(null);

        return new DashboardRecentBookingResponse(
            booking.getId(),
            booking.getUser().getName(),
            showTitle,
            booking.getStatus().name(),
            payment != null ? payment.getStatus().name() : "PENDING",
            booking.getTotalAmount(),
            booking.getCreatedAt()
        );
    }

    private BigDecimal defaultIfNull(BigDecimal value) {
        return value == null ? BigDecimal.ZERO : value;
    }

    private boolean hasRole(User user, AppRole role) {
        return user.getRoles().stream().anyMatch(userRole -> userRole.getName() == role);
    }
}
