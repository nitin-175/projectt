package com.showbooking.backend.controller;

import com.showbooking.backend.dto.show.CreateShowRequest;
import com.showbooking.backend.dto.show.CreateShowTimingRequest;
import com.showbooking.backend.dto.show.ShowResponse;
import com.showbooking.backend.security.SecurityUser;
import com.showbooking.backend.service.ShowService;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/shows")
public class ShowController {

    private final ShowService showService;
    private final ObjectMapper objectMapper;

    public ShowController(ShowService showService, ObjectMapper objectMapper) {
        this.showService = showService;
        this.objectMapper = objectMapper;
    }

    @GetMapping
    public List<ShowResponse> getShows() {
        return showService.getShows();
    }

    @GetMapping("/manage")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public List<ShowResponse> getManagedShows(@AuthenticationPrincipal SecurityUser securityUser) {
        return showService.getManagedShows(securityUser.getId());
    }

    @GetMapping("/{id}")
    public ShowResponse getShowById(@PathVariable("id") Long id) {
        return showService.getShowById(id);
    }

    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @ResponseStatus(HttpStatus.CREATED)
    public ShowResponse createShow(
            @AuthenticationPrincipal SecurityUser securityUser,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("duration") Integer duration,
            @RequestParam("language") String language,
            @RequestParam("genre") String genre,
            @RequestParam("venueIds") List<Long> venueIds,
            @RequestParam("timings") String timings,
            @RequestParam(value = "posterUrl", required = false) String posterUrl,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        CreateShowRequest request = new CreateShowRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDuration(duration);
        request.setLanguage(language);
        request.setGenre(genre);
        request.setPosterUrl(posterUrl);
        request.setVenueIds(venueIds);
        request.setTimings(parseTimings(timings));
        
        return showService.createShow(securityUser.getId(), request, image);
    }

    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    public ShowResponse updateShow(
            @AuthenticationPrincipal SecurityUser securityUser,
            @PathVariable("id") Long id,
            @RequestParam("title") String title,
            @RequestParam("description") String description,
            @RequestParam("duration") Integer duration,
            @RequestParam("language") String language,
            @RequestParam("genre") String genre,
            @RequestParam("venueIds") List<Long> venueIds,
            @RequestParam("timings") String timings,
            @RequestParam(value = "posterUrl", required = false) String posterUrl,
            @RequestParam(value = "image", required = false) org.springframework.web.multipart.MultipartFile image) {
        
        CreateShowRequest request = new CreateShowRequest();
        request.setTitle(title);
        request.setDescription(description);
        request.setDuration(duration);
        request.setLanguage(language);
        request.setGenre(genre);
        request.setPosterUrl(posterUrl);
        request.setVenueIds(venueIds);
        request.setTimings(parseTimings(timings));
        
        return showService.updateShow(securityUser.getId(), id, request, image);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'ORGANIZER')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteShow(@AuthenticationPrincipal SecurityUser securityUser, @PathVariable("id") Long id) {
        showService.deleteShow(securityUser.getId(), id);
    }

    private List<CreateShowTimingRequest> parseTimings(String timings) {
        try {
            return objectMapper.readValue(timings, new TypeReference<List<CreateShowTimingRequest>>() {});
        } catch (Exception exception) {
            throw new IllegalArgumentException("Invalid show timings payload");
        }
    }
}
