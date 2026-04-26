package com.showbooking.backend.controller;

import com.showbooking.backend.dto.payment.PaymentSimulationRequest;
import com.showbooking.backend.dto.payment.PaymentSimulationResponse;
import com.showbooking.backend.security.SecurityUser;
import com.showbooking.backend.service.PaymentService;
import jakarta.validation.Valid;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping("/simulate")
    @PreAuthorize("isAuthenticated()")
    public PaymentSimulationResponse simulatePayment(
        @AuthenticationPrincipal SecurityUser securityUser,
        @Valid @RequestBody PaymentSimulationRequest request
    ) {
        return paymentService.simulatePayment(securityUser.getId(), request);
    }
}
