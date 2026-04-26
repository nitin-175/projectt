package com.showbooking.backend.dto.show;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class CreateShowRequest {

    @NotBlank
    private String title;

    @NotBlank
    private String description;

    @Min(1)
    private Integer duration;

    @NotBlank
    private String language;

    @NotBlank
    private String genre;

    private String posterUrl;

    @NotEmpty
    private List<Long> venueIds;

    @NotEmpty
    private List<CreateShowTimingRequest> timings;
}
