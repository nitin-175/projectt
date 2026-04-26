package com.showbooking.backend.service;

import com.showbooking.backend.dto.auth.AuthResponse;
import com.showbooking.backend.dto.user.DeleteAccountRequest;
import com.showbooking.backend.dto.user.UpdateProfileRequest;
import com.showbooking.backend.dto.user.UserSummaryResponse;
import com.showbooking.backend.dto.venue.VenueSummaryResponse;
import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Role;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.RoleRepository;
import com.showbooking.backend.repository.UserRepository;
import com.showbooking.backend.repository.VenueRepository;
import com.showbooking.backend.security.JwtService;
import com.showbooking.backend.security.SecurityUser;
import jakarta.persistence.EntityNotFoundException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {

    private static final Logger log = LoggerFactory.getLogger(UserService.class);

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final VenueRepository venueRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserService(
        UserRepository userRepository,
        RoleRepository roleRepository,
        VenueRepository venueRepository,
        PasswordEncoder passwordEncoder,
        JwtService jwtService
    ) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.venueRepository = venueRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public List<UserSummaryResponse> getAllUsers() {
        return userRepository.findAll().stream()
                .sorted((u1, u2) -> {
                    int p1 = getMinRolePriority(u1);
                    int p2 = getMinRolePriority(u2);
                    return Integer.compare(p1, p2);
                })
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    private int getMinRolePriority(User user) {
        int min = 10;
        for (Role role : user.getRoles()) {
            int p = getRolePriority(role.getName());
            if (p < min) min = p;
        }
        log.info("User: {}, Min Priority: {}", user.getEmail(), min);
        return min;
    }

    private int getRolePriority(AppRole role) {
        if (role == null) return 10;
        return switch (role) {
            case ADMIN -> 1;
            case ORGANIZER -> 2;
            case STAFF -> 3;
            case USER -> 4;
            default -> 10;
        };
    }

    private UserSummaryResponse mapToResponse(User user) {
        return new UserSummaryResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getRoles().stream().map(role -> role.getName().name()).toList(),
                user.getVenues().stream().map(this::mapVenue).toList(),
                user.getCreatedAt()
        );
    }

    @Transactional
    public UserSummaryResponse updateUserRoles(Long userId, List<String> roleNames, List<Long> venueIds) {
        if (roleNames == null || roleNames.isEmpty()) {
            throw new IllegalArgumentException("At least one role must be assigned");
        }

        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        Set<Role> newRoles = roleNames.stream()
            .map(name -> roleRepository.findByName(AppRole.valueOf(name))
                .orElseThrow(() -> new EntityNotFoundException("Role not found: " + name)))
            .collect(Collectors.toSet());

        user.setRoles(newRoles);
        if (roleNames.contains(AppRole.ORGANIZER.name())) {
            Set<Venue> assignedVenues = venueIds == null
                ? Set.of()
                : venueIds.stream()
                    .map(venueId -> venueRepository.findById(venueId)
                        .orElseThrow(() -> new EntityNotFoundException("Venue not found: " + venueId)))
                    .collect(Collectors.toSet());
            user.setVenues(assignedVenues);
        } else {
            user.getVenues().clear();
        }
        User savedUser = userRepository.save(user);

        return mapToResponse(savedUser);
    }

    @Transactional
    public UserSummaryResponse createUser(String name, String email, String password) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email already registered");
        }

        Role userRole = roleRepository.findByName(AppRole.USER)
            .orElseThrow(() -> new EntityNotFoundException("USER role not found"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setRoles(Set.of(userRole));

        User savedUser = userRepository.save(user);
        return mapToResponse(savedUser);
    }

    @Transactional
    public AuthResponse updateProfile(Long userId, UpdateProfileRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        String normalizedEmail = request.getEmail().trim().toLowerCase();
        if (userRepository.existsByEmailAndIdNot(normalizedEmail, userId)) {
            throw new IllegalArgumentException("Email already registered");
        }

        user.setName(request.getName().trim());
        user.setEmail(normalizedEmail);
        if (request.getNewPassword() != null && !request.getNewPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getNewPassword().trim()));
        }

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

    @Transactional
    public void deleteProfile(Long userId, DeleteAccountRequest request) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPassword())) {
            throw new IllegalArgumentException("Current password is incorrect");
        }

        userRepository.delete(user);
    }

    private VenueSummaryResponse mapVenue(Venue venue) {
        return new VenueSummaryResponse(
            venue.getId(),
            venue.getName(),
            venue.getCity(),
            venue.getAddress()
        );
    }
}
