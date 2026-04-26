package com.showbooking.backend.repository;

import com.showbooking.backend.entity.Show;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Collection;
import java.util.List;

public interface ShowRepository extends JpaRepository<Show, Long> {
    List<Show> findDistinctByVenues_IdIn(Collection<Long> venueIds);
    boolean existsByIdAndVenues_IdIn(Long id, Collection<Long> venueIds);

    @Query("select count(distinct s.id) from Show s join s.venues v where v.id in :venueIds")
    long countDistinctByVenueIds(@Param("venueIds") Collection<Long> venueIds);
}
