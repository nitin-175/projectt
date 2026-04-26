package com.showbooking.backend.dto.payment;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class PaymentSimulationRequest {

    @NotNull
    private Long bookingId;

    @NotBlank
    private String paymentMethod;

    @NotBlank
    private String outcome;
}
