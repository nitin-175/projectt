INSERT INTO roles (name) VALUES ('USER'), ('ADMIN'), ('ORGANIZER'), ('STAFF');

INSERT INTO venues (name, city, address)
VALUES ('Skyline Arena', 'Bengaluru', '12 Residency Road');

INSERT INTO screens (venue_id, name, capacity)
VALUES (1, 'Main Hall', 120);

INSERT INTO seats (screen_id, seat_row, seat_number, seat_type)
VALUES
    (1, 'A', 1, 'REGULAR'),
    (1, 'A', 2, 'REGULAR'),
    (1, 'A', 3, 'REGULAR'),
    (1, 'A', 4, 'REGULAR');

INSERT INTO shows (title, description, duration, language, genre, poster_url)
VALUES
    ('Midnight Echoes', 'A neon-soaked thriller staged live.', 145, 'English', 'Thriller', ''),
    ('Raga & Rain', 'A musical performance inspired by monsoon moods.', 120, 'Hindi', 'Musical', '');

INSERT INTO show_timings (show_id, screen_id, start_time, price)
VALUES
    (1, 1, '2026-03-20 19:30:00', 620.00),
    (2, 1, '2026-03-21 18:00:00', 480.00);
