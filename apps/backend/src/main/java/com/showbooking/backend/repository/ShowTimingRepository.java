package com.showbooking.backend.repository;

import com.showbooking.backend.entity.ShowTiming;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

public interface ShowTimingRepository extends JpaRepository<ShowTiming, Long> {
    List<ShowTiming> findByShow_Id(Long showId);

    long countByStartTimeAfter(LocalDateTime now);

    @Query("select count(st.id) from ShowTiming st where st.startTime > :now and st.screen.venue.id in :venueIds")
    long countUpcomingByVenueIds(@Param("venueIds") Collection<Long> venueIds, @Param("now") LocalDateTime now);
}
