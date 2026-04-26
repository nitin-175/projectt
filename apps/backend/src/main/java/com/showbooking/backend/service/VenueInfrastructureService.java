package com.showbooking.backend.service;

import com.showbooking.backend.entity.Screen;
import com.showbooking.backend.entity.Seat;
import com.showbooking.backend.entity.SeatType;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.ScreenRepository;
import com.showbooking.backend.repository.SeatRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VenueInfrastructureService {

    private static final String DEFAULT_SCREEN_NAME = "Main Hall";
    private static final int DEFAULT_ROW_COUNT = 5;
    private static final int DEFAULT_SEATS_PER_ROW = 8;

    private final ScreenRepository screenRepository;
    private final SeatRepository seatRepository;

    public VenueInfrastructureService(ScreenRepository screenRepository, SeatRepository seatRepository) {
        this.screenRepository = screenRepository;
        this.seatRepository = seatRepository;
    }

    @Transactional
    public Screen ensureBookableScreen(Venue venue) {
        List<Screen> existingScreens = screenRepository.findByVenue_Id(venue.getId());
        if (!existingScreens.isEmpty()) {
            Screen screen = existingScreens.get(0);
            ensureSeats(screen);
            return screen;
        }

        Screen screen = new Screen();
        screen.setVenue(venue);
        screen.setName(DEFAULT_SCREEN_NAME);
        screen.setCapacity(DEFAULT_ROW_COUNT * DEFAULT_SEATS_PER_ROW);
        Screen savedScreen = screenRepository.save(screen);
        ensureSeats(savedScreen);
        return savedScreen;
    }

    private void ensureSeats(Screen screen) {
        if (!seatRepository.findByScreen_IdOrderBySeatRowAscSeatNumberAsc(screen.getId()).isEmpty()) {
            return;
        }

        for (int rowIndex = 0; rowIndex < DEFAULT_ROW_COUNT; rowIndex++) {
            String rowLabel = String.valueOf((char) ('A' + rowIndex));
            for (int seatNumber = 1; seatNumber <= DEFAULT_SEATS_PER_ROW; seatNumber++) {
                Seat seat = new Seat();
                seat.setScreen(screen);
                seat.setSeatRow(rowLabel);
                seat.setSeatNumber(seatNumber);
                seat.setSeatType(resolveSeatType(seatNumber));
                seatRepository.save(seat);
            }
        }
    }

    private SeatType resolveSeatType(int seatNumber) {
        if (seatNumber <= 2) {
            return SeatType.PREMIUM;
        }
        if (seatNumber >= 7) {
            return SeatType.VIP;
        }
        return SeatType.REGULAR;
    }
}
