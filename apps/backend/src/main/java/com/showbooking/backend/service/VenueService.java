package com.showbooking.backend.service;

import com.showbooking.backend.dto.venue.CreateVenueRequest;
import com.showbooking.backend.dto.venue.VenueSummaryResponse;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.VenueRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VenueService {

    private final VenueRepository venueRepository;
    private final VenueInfrastructureService venueInfrastructureService;

    public VenueService(VenueRepository venueRepository, VenueInfrastructureService venueInfrastructureService) {
        this.venueRepository = venueRepository;
        this.venueInfrastructureService = venueInfrastructureService;
    }

    @Transactional(readOnly = true)
    public List<VenueSummaryResponse> getAllVenues() {
        return venueRepository.findAll().stream()
            .map(this::mapVenue)
            .toList();
    }

    @Transactional
    public VenueSummaryResponse createVenue(CreateVenueRequest request) {
        Venue venue = new Venue();
        venue.setName(request.getName().trim());
        venue.setCity(request.getCity().trim());
        venue.setAddress(request.getAddress().trim());
        Venue savedVenue = venueRepository.save(venue);
        venueInfrastructureService.ensureBookableScreen(savedVenue);
        return mapVenue(savedVenue);
    }

    public VenueSummaryResponse mapVenue(Venue venue) {
        return new VenueSummaryResponse(
            venue.getId(),
            venue.getName(),
            venue.getCity(),
            venue.getAddress()
        );
    }
}
