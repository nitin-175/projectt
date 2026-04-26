package com.showbooking.backend.dto.user;

import jakarta.validation.constraints.NotEmpty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class UpdateUserRolesRequest {

    @NotEmpty
    private List<String> roles;

    private List<Long> venueIds;
}
