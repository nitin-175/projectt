package com.showbooking.backend.service;

import com.showbooking.backend.dto.show.CreateShowRequest;
import com.showbooking.backend.dto.show.CreateShowTimingRequest;
import com.showbooking.backend.dto.show.ShowResponse;
import com.showbooking.backend.dto.show.ShowTimingResponse;
import com.showbooking.backend.dto.venue.VenueSummaryResponse;
import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Screen;
import com.showbooking.backend.entity.Show;
import com.showbooking.backend.entity.ShowTiming;
import com.showbooking.backend.entity.Booking;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.BookingRepository;
import com.showbooking.backend.repository.ShowRepository;
import com.showbooking.backend.repository.ShowTimingRepository;
import com.showbooking.backend.repository.BookingSeatRepository;
import com.showbooking.backend.repository.UserRepository;
import com.showbooking.backend.repository.VenueRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class ShowService {

    private final ShowRepository showRepository;
    private final ShowTimingRepository showTimingRepository;
    private final VenueRepository venueRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookingSeatRepository bookingSeatRepository;
    private final FileStorageService fileStorageService;
    private final VenueInfrastructureService venueInfrastructureService;

    public ShowService(
        ShowRepository showRepository,
        ShowTimingRepository showTimingRepository,
        VenueRepository venueRepository,
        UserRepository userRepository,
        BookingRepository bookingRepository,
        BookingSeatRepository bookingSeatRepository,
        FileStorageService fileStorageService,
        VenueInfrastructureService venueInfrastructureService
    ) {
        this.showRepository = showRepository;
        this.showTimingRepository = showTimingRepository;
        this.venueRepository = venueRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.bookingSeatRepository = bookingSeatRepository;
        this.fileStorageService = fileStorageService;
        this.venueInfrastructureService = venueInfrastructureService;
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> getShows() {
        return showRepository.findAll().stream()
            .map(this::mapToShowResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public List<ShowResponse> getManagedShows(Long userId) {
        User user = getUser(userId);
        List<Show> shows;
        if (hasRole(user, AppRole.ADMIN)) {
            shows = showRepository.findAll();
        } else {
            Set<Long> accessibleVenueIds = getAccessibleVenueIds(user);
            shows = showRepository.findDistinctByVenues_IdIn(accessibleVenueIds).stream()
                .filter(show -> show.getVenues().stream().allMatch(venue -> accessibleVenueIds.contains(venue.getId())))
                .toList();
        }

        return shows.stream()
            .map(this::mapToShowResponse)
            .toList();
    }

    @Transactional(readOnly = true)
    public ShowResponse getShowById(Long id) {
        return mapToShowResponse(showRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Show not found: " + id)));
    }

    @Transactional
    public ShowResponse createShow(Long userId, CreateShowRequest request, MultipartFile image) {
        User user = getUser(userId);
        Set<Venue> selectedVenues = resolveAndValidateVenues(user, request.getVenueIds());

        Show show = new Show();
        applyShowUpdates(show, request, image, selectedVenues);
        return mapToShowResponse(showRepository.save(show));
    }

    @Transactional
    public ShowResponse updateShow(Long userId, Long id, CreateShowRequest request, MultipartFile image) {
        User user = getUser(userId);
        Show show = showRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Show not found"));

        ensureCanManageShow(user, show);
        Set<Venue> selectedVenues = resolveAndValidateVenues(user, request.getVenueIds());
        applyShowUpdates(show, request, image, selectedVenues);

        return mapToShowResponse(showRepository.save(show));
    }

    @Transactional
    public void deleteShow(Long userId, Long id) {
        User user = getUser(userId);
        Show show = showRepository.findById(id)
            .orElseThrow(() -> new EntityNotFoundException("Show not found"));

        ensureCanManageShow(user, show);

        if (bookingSeatRepository.existsByShowTiming_Show_Id(show.getId())) {
            if (!hasRole(user, AppRole.ADMIN)) {
                throw new IllegalArgumentException("Booked shows can only be deleted by an admin.");
            }
            deleteShowBookings(show.getId());
        }

        List<ShowTiming> existingTimings = showTimingRepository.findByShow_Id(show.getId());
        if (!existingTimings.isEmpty()) {
            showTimingRepository.deleteAll(existingTimings);
        }

        showRepository.delete(show);
    }

    private void applyShowUpdates(Show show, CreateShowRequest request, MultipartFile image, Set<Venue> venues) {
        show.setTitle(request.getTitle());
        show.setDescription(request.getDescription());
        show.setDuration(request.getDuration());
        show.setLanguage(request.getLanguage());
        show.setGenre(request.getGenre());
        show.setVenues(venues);

        if (image != null && !image.isEmpty()) {
            show.setPosterUrl(fileStorageService.save(image));
        } else {
            show.setPosterUrl(normalizePosterUrl(request.getPosterUrl()));
        }

        show = showRepository.save(show);
        replaceShowTimings(show, request.getTimings(), venues);
    }

    private Set<Venue> resolveAndValidateVenues(User user, List<Long> venueIds) {
        Set<Venue> selectedVenues = venueIds.stream()
            .map(venueId -> venueRepository.findById(venueId)
                .orElseThrow(() -> new EntityNotFoundException("Venue not found: " + venueId)))
            .collect(Collectors.toSet());

        if (selectedVenues.isEmpty()) {
            throw new IllegalArgumentException("At least one venue must be selected");
        }

        if (hasRole(user, AppRole.ORGANIZER) && !hasRole(user, AppRole.ADMIN)) {
            Set<Long> accessibleVenueIds = getAccessibleVenueIds(user);
            boolean allowed = selectedVenues.stream().allMatch(venue -> accessibleVenueIds.contains(venue.getId()));
            if (!allowed) {
                throw new IllegalArgumentException("You can only manage shows for your assigned venues");
            }
        }

        return selectedVenues;
    }

    private void replaceShowTimings(Show show, List<CreateShowTimingRequest> timingRequests, Set<Venue> selectedVenues) {
        if (timingRequests == null || timingRequests.isEmpty()) {
            throw new IllegalArgumentException("Add at least one show schedule.");
        }

        Map<Long, Venue> venueLookup = selectedVenues.stream()
            .collect(Collectors.toMap(Venue::getId, venue -> venue));

        List<ShowTiming> existingTimings = showTimingRepository.findByShow_Id(show.getId());
        if (hasSameSchedules(existingTimings, timingRequests)) {
            return;
        }
        if (!existingTimings.isEmpty() && bookingSeatRepository.existsByShowTiming_Show_Id(show.getId())) {
            throw new IllegalArgumentException("Booked shows cannot have their schedules changed.");
        }
        if (!existingTimings.isEmpty()) {
            showTimingRepository.deleteAll(existingTimings);
            showTimingRepository.flush();
        }

        List<ShowTiming> timings = timingRequests.stream()
            .map(timingRequest -> buildTiming(show, timingRequest, venueLookup))
            .toList();
        showTimingRepository.saveAll(timings);
    }

    private ShowTiming buildTiming(Show show, CreateShowTimingRequest request, Map<Long, Venue> venueLookup) {
        Venue venue = venueLookup.get(request.getVenueId());
        if (venue == null) {
            throw new IllegalArgumentException("Schedules must belong to one of the selected venues.");
        }
        if (request.getStartTime() == null || !request.getStartTime().isAfter(java.time.LocalDateTime.now())) {
            throw new IllegalArgumentException("Show schedules must be in the future.");
        }
        if (request.getPrice() == null || request.getPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException("Show schedule price must be greater than zero.");
        }

        Screen screen = venueInfrastructureService.ensureBookableScreen(venue);

        ShowTiming timing = new ShowTiming();
        timing.setShow(show);
        timing.setScreen(screen);
        timing.setStartTime(request.getStartTime());
        timing.setPrice(request.getPrice());
        return timing;
    }

    private boolean hasSameSchedules(List<ShowTiming> existingTimings, List<CreateShowTimingRequest> requestedTimings) {
        if (existingTimings.size() != requestedTimings.size()) {
            return false;
        }

        Set<String> existingKeys = existingTimings.stream()
            .map(timing -> scheduleKey(
                timing.getScreen().getVenue().getId(),
                timing.getStartTime().withSecond(0).withNano(0).toString(),
                timing.getPrice()
            ))
            .collect(Collectors.toSet());

        Set<String> requestedKeys = requestedTimings.stream()
            .map(timing -> scheduleKey(
                timing.getVenueId(),
                timing.getStartTime().withSecond(0).withNano(0).toString(),
                timing.getPrice()
            ))
            .collect(Collectors.toSet());

        return existingKeys.equals(requestedKeys);
    }

    private String scheduleKey(Long venueId, String startTime, BigDecimal price) {
        return venueId + "|" + startTime + "|" + price.stripTrailingZeros().toPlainString();
    }

    private void deleteShowBookings(Long showId) {
        List<Booking> relatedBookings = bookingRepository.findDistinctByShowId(showId);
        if (!relatedBookings.isEmpty()) {
            bookingRepository.deleteAll(relatedBookings);
            bookingRepository.flush();
        }
    }

    private String normalizePosterUrl(String posterUrl) {
        if (posterUrl == null) {
            return null;
        }

        String normalized = posterUrl.trim();
        if (normalized.isEmpty()) {
            return null;
        }

        if (normalized.startsWith("http://") || normalized.startsWith("https://") || normalized.startsWith("data:") || normalized.startsWith("/")) {
            return normalized;
        }

        if (normalized.startsWith("www.")) {
            return "https://" + normalized;
        }

        return normalized;
    }

    private void ensureCanManageShow(User user, Show show) {
        if (hasRole(user, AppRole.ADMIN)) {
            return;
        }

        Set<Long> accessibleVenueIds = getAccessibleVenueIds(user);
        boolean hasAccess = show.getVenues().stream().allMatch(venue -> accessibleVenueIds.contains(venue.getId()));
        if (!hasAccess) {
            throw new IllegalArgumentException("You can only manage shows for your assigned venues");
        }
    }

    private User getUser(Long userId) {
        return userRepository.findById(userId)
            .orElseThrow(() -> new EntityNotFoundException("User not found: " + userId));
    }

    private boolean hasRole(User user, AppRole role) {
        return user.getRoles().stream().anyMatch(userRole -> userRole.getName() == role);
    }

    private Set<Long> getAccessibleVenueIds(User user) {
        return user.getVenues().stream()
            .map(Venue::getId)
            .collect(Collectors.toSet());
    }

    private ShowResponse mapToShowResponse(Show show) {
        List<ShowTimingResponse> timings = showTimingRepository.findByShow_Id(show.getId()).stream()
            .map(this::mapTimingToResponse)
            .toList();
        List<VenueSummaryResponse> venues = show.getVenues().stream()
            .map(this::mapVenueToResponse)
            .toList();

        return new ShowResponse(
            show.getId(),
            show.getTitle(),
            show.getDescription(),
            show.getDuration(),
            show.getLanguage(),
            show.getGenre(),
            show.getPosterUrl(),
            venues.stream().map(VenueSummaryResponse::id).toList(),
            venues,
            timings
        );
    }

    private ShowTimingResponse mapTimingToResponse(ShowTiming timing) {
        return new ShowTimingResponse(
            timing.getId(),
            timing.getScreen().getName(),
            timing.getScreen().getVenue().getId(),
            timing.getScreen().getVenue().getName(),
            timing.getScreen().getVenue().getCity(),
            timing.getStartTime(),
            timing.getPrice()
        );
    }

    private VenueSummaryResponse mapVenueToResponse(Venue venue) {
        return new VenueSummaryResponse(
            venue.getId(),
            venue.getName(),
            venue.getCity(),
            venue.getAddress()
        );
    }
}
