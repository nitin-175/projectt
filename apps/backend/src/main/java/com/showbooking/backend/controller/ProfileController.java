package com.showbooking.backend.controller;

import com.showbooking.backend.dto.auth.AuthResponse;
import com.showbooking.backend.dto.user.DeleteAccountRequest;
import com.showbooking.backend.dto.user.UpdateProfileRequest;
import com.showbooking.backend.security.SecurityUser;
import com.showbooking.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;

@RestController
@RequestMapping("/api/users/me")
public class ProfileController {

    private final UserService userService;

    public ProfileController(UserService userService) {
        this.userService = userService;
    }

    @PutMapping
    public AuthResponse updateProfile(
        @AuthenticationPrincipal SecurityUser securityUser,
        @Valid @RequestBody UpdateProfileRequest request
    ) {
        return userService.updateProfile(securityUser.getId(), request);
    }

    @DeleteMapping
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteProfile(
        @AuthenticationPrincipal SecurityUser securityUser,
        @Valid @RequestBody DeleteAccountRequest request
    ) {
        userService.deleteProfile(securityUser.getId(), request);
    }
}
