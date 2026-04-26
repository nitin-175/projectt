package com.showbooking.backend.service;

import com.showbooking.backend.dto.booking.BookingRequest;
import com.showbooking.backend.dto.booking.BookingResponse;
import com.showbooking.backend.entity.Booking;
import com.showbooking.backend.entity.BookingSeat;
import com.showbooking.backend.entity.BookingStatus;
import com.showbooking.backend.entity.Payment;
import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Seat;
import com.showbooking.backend.entity.ShowTiming;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.repository.BookingRepository;
import com.showbooking.backend.repository.BookingSeatRepository;
import com.showbooking.backend.repository.PaymentRepository;
import com.showbooking.backend.repository.SeatRepository;
import com.showbooking.backend.repository.ShowTimingRepository;
import com.showbooking.backend.repository.UserRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final UserRepository userRepository;
    private final ShowTimingRepository showTimingRepository;
    private final SeatRepository seatRepository;
    private final PaymentRepository paymentRepository;

    public BookingService(
        BookingRepository bookingRepository,
        BookingSeatRepository bookingSeatRepository,
        UserRepository userRepository,
        ShowTimingRepository showTimingRepository,
        SeatRepository seatRepository,
        PaymentRepository paymentRepository
    ) {
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.userRepository = userRepository;
        this.showTimingRepository = showTimingRepository;
        this.seatRepository = seatRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public BookingResponse createBooking(Long userId, BookingRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (hasRestrictedBookingRole(user)) {
            throw new IllegalStateException("Admin and organizer accounts cannot book shows.");
        }

        ShowTiming showTiming = showTimingRepository.findById(request.getShowTimingId())
            .orElseThrow(() -> new EntityNotFoundException("Show timing not found: " + request.getShowTimingId()));

        if (!showTiming.getStartTime().isAfter(LocalDateTime.now())) {
            throw new IllegalArgumentException("Past shows cannot be booked.");
        }

        for (Long seatId : request.getSeatIds()) {
            if (bookingSeatRepository.existsByShowTiming_IdAndSeat_Id(showTiming.getId(), seatId)) {
                throw new IllegalStateException("Seat already booked: " + seatId);
            }
        }

        BigDecimal totalAmount = showTiming.getPrice().multiply(BigDecimal.valueOf(request.getSeatIds().size()));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setStatus(BookingStatus.PENDING_PAYMENT);
        booking.setTotalAmount(totalAmount);
        Booking savedBooking = bookingRepository.save(booking);

        for (Long seatId : request.getSeatIds()) {
            Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new EntityNotFoundException("Seat not found: " + seatId));
            if (!seat.getScreen().getId().equals(showTiming.getScreen().getId())) {
                throw new IllegalArgumentException("Seat does not belong to the selected show timing: " + seatId);
            }
            BookingSeat bookingSeat = new BookingSeat();
            bookingSeat.setBooking(savedBooking);
            bookingSeat.setSeat(seat);
            bookingSeat.setShowTiming(showTiming);
            bookingSeatRepository.save(bookingSeat);
        }

        return toResponse(savedBooking);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return bookingRepository.findByUser_IdOrderByCreatedAtDesc(userId).stream()
            .map(this::toResponse)
            .toList();
    }

    private BookingResponse toResponse(Booking booking) {
        List<BookingSeat> bookingSeats = bookingSeatRepository.findByBooking_Id(booking.getId());
        List<Long> seatIds = bookingSeats.stream()
            .map(bookingSeat -> bookingSeat.getSeat().getId())
            .toList();
        List<String> seatNumbers = bookingSeats.stream()
            .map(bookingSeat -> bookingSeat.getSeat().getSeatRow() + bookingSeat.getSeat().getSeatNumber())
            .toList();
        Long showTimingId = bookingSeats.stream()
            .findFirst()
            .map(bookingSeat -> bookingSeat.getShowTiming().getId())
            .orElse(null);
        String showTitle = bookingSeats.stream()
            .findFirst()
            .map(bookingSeat -> bookingSeat.getShowTiming().getShow().getTitle())
            .orElse(null);
        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElse(null);

        return new BookingResponse(
            booking.getId(),
            booking.getUser().getId(),
            booking.getTotalAmount(),
            booking.getStatus().name(),
            booking.getCreatedAt(),
            showTimingId,
            showTitle,
            seatIds,
            seatNumbers,
            payment != null ? payment.getStatus().name() : null,
            payment != null ? payment.getTransactionId() : null,
            payment != null ? payment.getPaymentMethod() : null
        );
    }

    private boolean hasRestrictedBookingRole(User user) {
        return user.getRoles().stream()
            .anyMatch(role -> role.getName() == AppRole.ADMIN || role.getName() == AppRole.ORGANIZER);
    }
}
