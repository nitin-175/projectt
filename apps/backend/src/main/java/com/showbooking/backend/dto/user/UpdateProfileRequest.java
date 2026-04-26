package com.showbooking.backend.dto.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class UpdateProfileRequest {

    @NotBlank
    private String name;

    @Email
    @NotBlank
    private String email;

    @NotBlank(message = "Current password is required")
    private String currentPassword;

    @Size(min = 6, max = 100, message = "New password must be at least 6 characters long")
    private String newPassword;
}
