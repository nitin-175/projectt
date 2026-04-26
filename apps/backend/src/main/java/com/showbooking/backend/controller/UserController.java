package com.showbooking.backend.controller;

import com.showbooking.backend.dto.auth.RegisterRequest;
import com.showbooking.backend.dto.user.UpdateUserRolesRequest;
import com.showbooking.backend.dto.user.UserSummaryResponse;
import com.showbooking.backend.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public List<UserSummaryResponse> getAllUsers() {
        return userService.getAllUsers();
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.CREATED)
    public UserSummaryResponse createUser(@Valid @RequestBody RegisterRequest request) {
        return userService.createUser(request.getName(), request.getEmail(), request.getPassword());
    }

    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public UserSummaryResponse updateRoles(@PathVariable("id") Long id, @Valid @RequestBody UpdateUserRolesRequest request) {
        return userService.updateUserRoles(id, request.getRoles(), request.getVenueIds());
    }
}
