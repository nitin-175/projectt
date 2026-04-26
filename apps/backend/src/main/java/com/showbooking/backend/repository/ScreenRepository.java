package com.showbooking.backend.repository;

import com.showbooking.backend.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ScreenRepository extends JpaRepository<Screen, Long> {
    List<Screen> findByVenue_Id(Long venueId);
}
