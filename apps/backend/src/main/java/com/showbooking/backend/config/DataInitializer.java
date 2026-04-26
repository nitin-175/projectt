package com.showbooking.backend.config;

import com.showbooking.backend.entity.AppRole;
import com.showbooking.backend.entity.Role;
import com.showbooking.backend.entity.Screen;
import com.showbooking.backend.entity.Seat;
import com.showbooking.backend.entity.SeatType;
import com.showbooking.backend.entity.Show;
import com.showbooking.backend.entity.ShowTiming;
import com.showbooking.backend.entity.User;
import com.showbooking.backend.entity.Venue;
import com.showbooking.backend.repository.ScreenRepository;
import com.showbooking.backend.repository.SeatRepository;
import com.showbooking.backend.repository.RoleRepository;
import com.showbooking.backend.repository.ShowRepository;
import com.showbooking.backend.repository.ShowTimingRepository;
import com.showbooking.backend.repository.UserRepository;
import com.showbooking.backend.repository.VenueRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.annotation.Order;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Configuration
public class DataInitializer {

    @Bean
    @Order(1)
    CommandLineRunner seedRoles(RoleRepository roleRepository) {
        return args -> Arrays.stream(AppRole.values()).forEach(roleName ->
            roleRepository.findByName(roleName).orElseGet(() -> {
                Role role = new Role();
                role.setName(roleName);
                return roleRepository.save(role);
            })
        );
    }

    @Bean
    @Order(2)
    @ConditionalOnProperty(name = "app.seed.demo-data", havingValue = "true")
    CommandLineRunner seedDemoData(
        VenueRepository venueRepository,
        ScreenRepository screenRepository,
        SeatRepository seatRepository,
        ShowRepository showRepository,
        ShowTimingRepository showTimingRepository,
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder
    ) {
        return args -> {
            seedUserIfMissing(userRepository, roleRepository, passwordEncoder, "Demo User", "user@stagepass.local", "password123", AppRole.USER);
            seedUserIfMissing(userRepository, roleRepository, passwordEncoder, "Admin User", "admin@stagepass.local", "admin123", AppRole.ADMIN);
            User organizer = seedUserIfMissing(userRepository, roleRepository, passwordEncoder, "Organizer User", "organizer@stagepass.local", "organizer123", AppRole.ORGANIZER);

            if (venueRepository.count() > 0 || screenRepository.count() > 0 || showRepository.count() > 0 || showTimingRepository.count() > 0) {
                return;
            }

            Venue venue = new Venue();
            venue.setName("Skyline Arena");
            venue.setCity("Bengaluru");
            venue.setAddress("12 Residency Road");
            Venue savedVenue = venueRepository.save(venue);

            organizer.getVenues().add(savedVenue);
            userRepository.save(organizer);

            Screen screen = new Screen();
            screen.setVenue(savedVenue);
            screen.setName("Main Hall");
            screen.setCapacity(40);
            Screen savedScreen = screenRepository.save(screen);

            List<String> rows = List.of("A", "B", "C", "D", "E");
            for (String row : rows) {
                for (int seatNumber = 1; seatNumber <= 8; seatNumber++) {
                    Seat seat = new Seat();
                    seat.setScreen(savedScreen);
                    seat.setSeatRow(row);
                    seat.setSeatNumber(seatNumber);
                    seat.setSeatType(seatNumber <= 2 ? SeatType.PREMIUM : SeatType.REGULAR);
                    seatRepository.save(seat);
                }
            }

            Show midnightEchoes = new Show();
            midnightEchoes.setTitle("Midnight Echoes");
            midnightEchoes.setDescription("A neon-soaked thriller staged with immersive sound design.");
            midnightEchoes.setDuration(145);
            midnightEchoes.setLanguage("English");
            midnightEchoes.setGenre("Thriller");
            midnightEchoes.setPosterUrl("https://picsum.photos/seed/midnight/800/1200");
            midnightEchoes.getVenues().add(savedVenue);
            Show savedMidnightEchoes = showRepository.save(midnightEchoes);

            Show ragaAndRain = new Show();
            ragaAndRain.setTitle("Raga & Rain");
            ragaAndRain.setDescription("A musical journey that blends classical performance with monsoon moods.");
            ragaAndRain.setDuration(120);
            ragaAndRain.setLanguage("Hindi");
            ragaAndRain.setGenre("Musical");
            ragaAndRain.setPosterUrl("https://picsum.photos/seed/raga/800/1200");
            ragaAndRain.getVenues().add(savedVenue);
            Show savedRagaAndRain = showRepository.save(ragaAndRain);
            
            Show neonNoir = new Show();
            neonNoir.setTitle("Neon Noir: The Musical");
            neonNoir.setDescription("A high-energy synthwave musical set in a futuristic cityscape.");
            neonNoir.setDuration(130);
            neonNoir.setLanguage("English");
            neonNoir.setGenre("Musical");
            neonNoir.setPosterUrl("https://picsum.photos/seed/neon/800/1200");
            neonNoir.getVenues().add(savedVenue);
            Show savedNeonNoir = showRepository.save(neonNoir);

            Show silentOpera = new Show();
            silentOpera.setTitle("The Silent Opera");
            silentOpera.setDescription("A breathtaking performance of movement and light, reimagining tragic tales.");
            silentOpera.setDuration(90);
            silentOpera.setLanguage("None");
            silentOpera.setGenre("Opera");
            silentOpera.setPosterUrl("https://picsum.photos/seed/opera/800/1200");
            silentOpera.getVenues().add(savedVenue);
            Show savedSilentOpera = showRepository.save(silentOpera);

            Show jazzNights = new Show();
            jazzNights.setTitle("Midnight Jazz Sessions");
            jazzNights.setDescription("Intimate lounge performances by world-class jazz quartets.");
            jazzNights.setDuration(110);
            jazzNights.setLanguage("English");
            jazzNights.setGenre("Jazz");
            jazzNights.setPosterUrl("https://picsum.photos/seed/jazz/800/1200");
            jazzNights.getVenues().add(savedVenue);
            Show savedJazzNights = showRepository.save( jazzNights);

            Show grandBroadway = new Show();
            grandBroadway.setTitle("Broadway Spectacular");
            grandBroadway.setDescription("The pinnacle of theatrical performance, featuring award-winning compositions.");
            grandBroadway.setDuration(160);
            grandBroadway.setLanguage("English");
            grandBroadway.setGenre("Theater");
            grandBroadway.setPosterUrl("https://picsum.photos/seed/broadway/800/1200");
            grandBroadway.getVenues().add(savedVenue);
            Show savedGrandBroadway = showRepository.save(grandBroadway);

            createTiming(showTimingRepository, savedMidnightEchoes, savedScreen, LocalDateTime.now().plusDays(1).withHour(19).withMinute(30), BigDecimal.valueOf(1250));
            createTiming(showTimingRepository, savedMidnightEchoes, savedScreen, LocalDateTime.now().plusDays(2).withHour(21).withMinute(0), BigDecimal.valueOf(1450));
            createTiming(showTimingRepository, savedRagaAndRain, savedScreen, LocalDateTime.now().plusDays(1).withHour(18).withMinute(15), BigDecimal.valueOf(980));
            createTiming(showTimingRepository, savedNeonNoir, savedScreen, LocalDateTime.now().plusDays(1).withHour(20).withMinute(0), BigDecimal.valueOf(1800));
            createTiming(showTimingRepository, savedSilentOpera, savedScreen, LocalDateTime.now().plusDays(3).withHour(19).withMinute(0), BigDecimal.valueOf(2500));
            createTiming(showTimingRepository, savedJazzNights, savedScreen, LocalDateTime.now().plusDays(2).withHour(22).withMinute(30), BigDecimal.valueOf(1100));
            createTiming(showTimingRepository, savedGrandBroadway, savedScreen, LocalDateTime.now().plusDays(4).withHour(18).withMinute(0), BigDecimal.valueOf(3200));
        };
    }

    private void createTiming(
        ShowTimingRepository showTimingRepository,
        Show show,
        Screen screen,
        LocalDateTime startTime,
        BigDecimal price
    ) {
        ShowTiming timing = new ShowTiming();
        timing.setShow(show);
        timing.setScreen(screen);
        timing.setStartTime(startTime);
        timing.setPrice(price);
        showTimingRepository.save(timing);
    }

    private User seedUserIfMissing(
        UserRepository userRepository,
        RoleRepository roleRepository,
        PasswordEncoder passwordEncoder,
        String name,
        String email,
        String password,
        AppRole roleName
    ) {
        if (userRepository.existsByEmail(email)) {
            return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("User lookup failed for " + email));
        }

        Role role = roleRepository.findByName(roleName)
            .orElseThrow(() -> new IllegalStateException("Missing role " + roleName));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.getRoles().add(role);
        return userRepository.save(user);
    }
}
