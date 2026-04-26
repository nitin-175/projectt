package com.showbooking.backend.service;

import com.showbooking.backend.dto.auth.AuthRequest;
import com.showbooking.backend.dto.auth.AuthResponse;
import com.showbooking.backend.dto.auth.GoogleUserInfoResponse;
import com.showbooking.backend.dto.auth.RegisterRequest;
import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Role;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.repository.RoleRepository;
import com.showbooking.backend.repository.UserRepository;
import com.showbooking.backend.security.JwtService;
import com.showbooking.backend.security.SecurityUser;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;

    public AuthService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder,
        AuthenticationManager authenticationManager,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role userRole = roleRepository.findByName(AppRole.USER)
            .orElseThrow(() -> new EntityNotFoundException("USER role is not configured"));

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);
        SecurityUser securityUser = new SecurityUser(savedUser);

        return new AuthResponse(
            jwtService.generateToken(securityUser),
            savedUser.getName(),
            savedUser.getEmail(),
            savedUser.getRoles().stream().map(role -> role.getName().name()).toList(),
            savedUser.getVenues().stream().map(venue -> venue.getId()).toList()
        );
    }

    public AuthResponse login(AuthRequest request) {
        authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
            .orElseThrow(() -> new EntityNotFoundException("User not found"));

        SecurityUser securityUser = new SecurityUser(user);

        return new AuthResponse(
            jwtService.generateToken(securityUser),
            user.getName(),
            user.getEmail(),
            user.getRoles().stream().map(role -> role.getName().name()).toList(),
            user.getVenues().stream().map(venue -> venue.getId()).toList()
        );
    }

    @Transactional
    public AuthResponse loginWithGoogle(GoogleUserInfoResponse googleUser) {
        if (googleUser.email() == null || googleUser.email().isBlank()) {
            throw new IllegalArgumentException("Google account did not provide an email address");
        }
        if (!Boolean.TRUE.equals(googleUser.verifiedEmail())) {
            throw new IllegalArgumentException("Google account email must be verified");
        }

        String normalizedEmail = googleUser.email().trim().toLowerCase();
        User user = userRepository.findByEmail(normalizedEmail).orElseGet(() -> {
            Role userRole = roleRepository.findByName(AppRole.USER)
                .orElseThrow(() -> new EntityNotFoundException("USER role is not configured"));

            User createdUser = new User();
            createdUser.setName(googleUser.name() == null || googleUser.name().isBlank() ? normalizedEmail : googleUser.name().trim());
            createdUser.setEmail(normalizedEmail);
            createdUser.setPassword(passwordEncoder.encode(java.util.UUID.randomUUID().toString()));
            createdUser.setRoles(Set.of(userRole));
            return userRepository.save(createdUser);
        });

        SecurityUser securityUser = new SecurityUser(user);
        return new AuthResponse(
            jwtService.generateToken(securityUser),
            user.getName(),
            user.getEmail(),
            user.getRoles().stream().map(role -> role.getName().name()).toList(),
            user.getVenues().stream().map(venue -> venue.getId()).toList()
        );
    }
}
