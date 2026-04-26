package com.showbooking.backend.dto.payment;

public record PaymentSimulationResponse(
    Long bookingId,
    String transactionId,
    String paymentStatus,
    String bookingStatus,
    String paymentMethod
) {
}
