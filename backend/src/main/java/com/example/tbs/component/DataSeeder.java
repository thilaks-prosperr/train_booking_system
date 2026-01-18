/*
 * Copyright (c) 2026 Thilaks. All Rights Reserved.
 *
 * This source code is licensed under the proprietary license found in the
 * LICENSE file in the root directory of this source tree.
 */

package com.example.tbs.component;

import com.example.tbs.entity.Station;
import com.example.tbs.entity.Train;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.entity.User;
import com.example.tbs.repository.*;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final UserRepository userRepository;
    private final BookingRepository bookingRepository;
    private final BookedSeatRepository bookedSeatRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public DataSeeder(StationRepository stationRepository, TrainRepository trainRepository,
            TrainScheduleRepository trainScheduleRepository, UserRepository userRepository,
            BookingRepository bookingRepository, BookedSeatRepository bookedSeatRepository,
            PasswordEncoder passwordEncoder) {
        this.stationRepository = stationRepository;
        this.trainRepository = trainRepository;
        this.trainScheduleRepository = trainScheduleRepository;
        this.userRepository = userRepository;
        this.bookingRepository = bookingRepository;
        this.bookedSeatRepository = bookedSeatRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // 1. Clear Data (Order matters for FK constraints)
        System.out.println("Cleaning up database...");

        // Use deleteAllInBatch for potentially faster and more direct deletion
        // (If supported by repository, otherwise falls back or we use deleteAll)
        try {
            bookedSeatRepository.deleteAll();
            bookingRepository.deleteAll();
            trainScheduleRepository.deleteAll();
            trainRepository.deleteAll();
            stationRepository.deleteAll();
            System.out.println("Tables cleared.");
        } catch (Exception e) {
            System.err.println("Error clearing tables: " + e.getMessage());
            e.printStackTrace();
            // Re-throw to fail startup if we can't clear
            throw e;
        }

        long stationCount = stationRepository.count();
        if (stationCount > 0) {
            System.err.println("WARNING: Stations were not deleted! Count: " + stationCount);
        } else {
            System.out.println("Database cleanup complete (Users preserved).");
        }

        // 2. Ensure Users Exist
        seedUsers();

        // 3. Seed Stations (15 total)
        List<Station> allStations = seedStations();

        // 4. Seed Trains
        seedTrains(allStations);

        System.out.println("Data Seeding Verification Complete!");
    }

    private void seedUsers() {
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole("ADMIN");
            admin.setEmail("admin@example.com");
            admin.setFullName("Admin User");
            userRepository.save(admin);
            System.out.println("Created admin user");
        } else {
            // Reset admin password just in case
            User admin = userRepository.findByUsername("admin").get();
            admin.setPassword(passwordEncoder.encode("admin"));
            userRepository.save(admin);
        }

        if (!userRepository.existsByUsername("user")) {
            User user = new User();
            user.setUsername("user");
            user.setPassword(passwordEncoder.encode("password"));
            user.setRole("USER");
            user.setEmail("user@example.com");
            user.setFullName("Test User");
            userRepository.save(user);
            System.out.println("Created regular user");
        }
    }

    private List<Station> seedStations() {
        List<Station> stations = new ArrayList<>();

        // 10 Real Stations
        stations.add(createStationObj("SBC", "KSR Bengaluru", "Bengaluru", 12.9716, 77.5946));
        stations.add(createStationObj("YPR", "Yesvantpur Jn", "Bengaluru", 13.0238, 77.5529));
        stations.add(createStationObj("TK", "Tumakuru", "Tumakuru", 13.3396, 77.1018));
        stations.add(createStationObj("HAS", "Hassan Jn", "Hassan", 13.0033, 76.1004));
        stations.add(createStationObj("MYS", "Mysuru Jn", "Mysuru", 12.3118, 76.6548));
        stations.add(createStationObj("ASK", "Arsikere Jn", "Arsikere", 13.3100, 76.2500));
        stations.add(createStationObj("DVG", "Davangere", "Davangere", 14.4644, 75.9218));
        stations.add(createStationObj("UBL", "Hubballi Jn", "Hubballi", 15.3647, 75.1240));
        stations.add(createStationObj("BGM", "Belagavi", "Belagavi", 15.8497, 74.4977));
        stations.add(createStationObj("MAQ", "Mangaluru Ctrl", "Mangaluru", 12.8674, 74.8427));

        // 5 Dummy Stations
        stations.add(createStationObj("STA", "Station A", "Alpha City", 13.5000, 76.5000));
        stations.add(createStationObj("STB", "Station B", "Beta Town", 13.6000, 76.6000));
        stations.add(createStationObj("STC", "Station C", "Gamma Ville", 13.7000, 76.7000));
        stations.add(createStationObj("STD", "Station D", "Delta OUtpost", 13.8000, 76.8000));
        stations.add(createStationObj("STE", "Station E", "Epsilon Base", 13.9000, 76.9000));

        return stationRepository.saveAll(stations);
    }

    private void seedTrains(List<Station> stations) {
        int trainCount = 1;

        // A. Direct Trains: 3 from EVERY source to a RANDOM destination
        // Total = 15 sources * 3 = 45 trains
        for (Station source : stations) {
            for (int i = 0; i < 3; i++) {
                Station dest = source;
                // Find a different destination
                while (dest.getStationId().equals(source.getStationId())) {
                    dest = stations.get(random.nextInt(stations.size()));
                }

                String trainNum = String.format("1%04d", trainCount++);
                String trainName = source.getStationCode() + "-" + dest.getStationCode() + " Exp";

                // Randomize time logic
                LocalTime startTime = LocalTime.of(random.nextInt(18) + 4, random.nextInt(60)); // 04:00 to 22:00

                double dist = calculateDistance(source, dest);
                int speed = 60 + random.nextInt(30); // 60-90 km/h
                int durationMins = (int) ((dist / speed) * 60);

                // Add intermediates? For "Direct" logical trains, we can just add start and end
                // BUT better to add 1-2 random stops in between to make it look realistic if
                // distance is large
                List<Station> path = generatePath(stations, source, dest);

                Train train = createTrain(trainNum, trainName, 60, dist * 1.5); // Price logic
                createFullSchedule(train, path, startTime, speed);
            }
        }

        // B. Indirect Trains: Small distance hops
        // "Lot of indirect trains" -> Let's add 30 random short hops
        for (int i = 0; i < 30; i++) {
            Station start = stations.get(random.nextInt(stations.size()));
            List<Station> nearby = new ArrayList<>();
            for (Station s : stations) {
                if (!s.getStationId().equals(start.getStationId()) && calculateDistance(start, s) < 250) {
                    nearby.add(s);
                }
            }

            if (!nearby.isEmpty()) {
                Station end = nearby.get(random.nextInt(nearby.size()));
                String trainNum = String.format("0%04d", trainCount++);
                String trainName = "Pass " + start.getStationCode() + "-" + end.getStationCode();

                LocalTime startTime = LocalTime.of(6 + random.nextInt(14), random.nextInt(60)); // Day trains
                double dist = calculateDistance(start, end);
                Train train = createTrain(trainNum, trainName, 40, dist * 0.8); // Cheaper

                // Simple 2-stop schedule for short hops
                createSchedule(train, start, startTime, startTime.plusMinutes(5), 1, 0);
                int duration = (int) ((dist / 40) * 60);
                createSchedule(train, end, startTime.plusMinutes(duration), startTime.plusMinutes(duration), 2,
                        (int) dist);
            }
        }
    }

    private List<Station> generatePath(List<Station> allStations, Station start, Station end) {
        List<Station> path = new ArrayList<>();
        path.add(start);

        // Maybe pick 1 random intermediate that is somewhat "between" them
        // geographically?
        // For simplicity, just pick 1 random station if distance > 300km
        if (calculateDistance(start, end) > 300) {
            Station mid = allStations.get(random.nextInt(allStations.size()));
            if (!mid.equals(start) && !mid.equals(end)) {
                path.add(mid);
            }
        }

        path.add(end);
        return path;
    }

    private void createFullSchedule(Train train, List<Station> path, LocalTime startTime, int speed) {
        LocalTime currentTime = startTime;
        int currentDist = 0;

        for (int i = 0; i < path.size(); i++) {
            Station station = path.get(i);

            if (i > 0) {
                Station prev = path.get(i - 1);
                int dist = (int) calculateDistance(prev, station);
                currentDist += dist;
                int travelMins = (int) ((dist / (double) speed) * 60);
                currentTime = currentTime.plusMinutes(travelMins);
            }

            LocalTime arrival = currentTime;
            LocalTime departure = (i == path.size() - 1) ? arrival : currentTime.plusMinutes(5); // 5 min halt
            if (departure != null)
                currentTime = departure;

            createSchedule(train, station, arrival, departure, i + 1, currentDist);
        }
    }

    private Station createStationObj(String code, String name, String city, double lat, double lng) {
        Station s = new Station();
        s.setStationCode(code);
        s.setStationName(name);
        s.setCity(city);
        s.setLatitude(lat);
        s.setLongitude(lng);
        return s;
    }

    private Train createTrain(String number, String name, int seats, double price) {
        Train t = new Train();
        t.setTrainNumber(number);
        t.setTrainName(name);
        t.setTotalSeatsPerCoach(40); // User requested fixed 40
        t.setNumberOfCoaches(3); // User requested fixed 3
        t.setPrice((long) Math.max(50, Math.ceil(price))); // Min price 50
        return trainRepository.save(t);
    }

    private void createSchedule(Train train, Station station, LocalTime arrival, LocalTime departure, int seq,
            int distance) {
        TrainSchedule ts = new TrainSchedule();
        ts.setTrain(train);
        ts.setStation(station);
        ts.setArrivalTime(arrival);
        ts.setDepartureTime(departure);
        ts.setStopSequence(seq);
        ts.setDistanceFromStartKm(distance);
        trainScheduleRepository.save(ts);
    }

    private double calculateDistance(Station s1, Station s2) {
        double latDiff = s1.getLatitude() - s2.getLatitude();
        double lngDiff = s1.getLongitude() - s2.getLongitude();
        // Approx conversion for Karnataka/India lat
        double latKm = latDiff * 111;
        double lngKm = lngDiff * 111 * Math.cos(Math.toRadians(s1.getLatitude()));
        return Math.sqrt(latKm * latKm + lngKm * lngKm);
    }
}
