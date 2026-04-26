package com.showbooking.backend.service;

import com.showbooking.backend.dto.payment.PaymentSimulationRequest;
import com.showbooking.backend.dto.payment.PaymentSimulationResponse;
import com.showbooking.backend.entity.Booking;
import com.showbooking.backend.entity.BookingStatus;
import com.showbooking.backend.entity.Payment;
import com.showbooking.backend.entity.PaymentStatus;
import com.showbooking.backend.repository.BookingRepository;
import com.showbooking.backend.repository.PaymentRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
public class PaymentService {

    private final BookingRepository bookingRepository;
    private final PaymentRepository paymentRepository;

    public PaymentService(BookingRepository bookingRepository, PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public PaymentSimulationResponse simulatePayment(Long userId, PaymentSimulationRequest request) {
        Booking booking = bookingRepository.findById(request.getBookingId())
            .orElseThrow(() -> new EntityNotFoundException("Booking not found: " + request.getBookingId()));

        if (!booking.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("You can only pay for your own bookings");
        }

        if (booking.getStatus() == BookingStatus.CONFIRMED) {
            throw new IllegalStateException("Booking has already been paid successfully");
        }

        Payment payment = paymentRepository.findByBooking_Id(booking.getId()).orElseGet(() -> {
            Payment createdPayment = new Payment();
            createdPayment.setBooking(booking);
            createdPayment.setAmount(booking.getTotalAmount());
            createdPayment.setTransactionId(generateTransactionId());
            return createdPayment;
        });

        payment.setPaymentMethod(request.getPaymentMethod());

        if ("SUCCESS".equalsIgnoreCase(request.getOutcome())) {
            payment.setStatus(PaymentStatus.SUCCESS);
            booking.setStatus(BookingStatus.CONFIRMED);
        } else {
            payment.setStatus(PaymentStatus.FAILED);
            booking.setStatus(BookingStatus.FAILED);
        }

        Payment savedPayment = paymentRepository.save(payment);
        Booking savedBooking = bookingRepository.save(booking);

        return new PaymentSimulationResponse(
            savedBooking.getId(),
            savedPayment.getTransactionId(),
            savedPayment.getStatus().name(),
            savedBooking.getStatus().name(),
            savedPayment.getPaymentMethod()
        );
    }

    private String generateTransactionId() {
        return "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
    }
}
