package com.example.tbs.component;

import com.example.tbs.entity.Station;
import com.example.tbs.entity.Train;
import com.example.tbs.entity.TrainSchedule;
import com.example.tbs.entity.User;
import com.example.tbs.repository.StationRepository;
import com.example.tbs.repository.TrainRepository;
import com.example.tbs.repository.TrainScheduleRepository;
import com.example.tbs.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Random;

@Component
public class DataSeeder implements CommandLineRunner {

    private final StationRepository stationRepository;
    private final TrainRepository trainRepository;
    private final TrainScheduleRepository trainScheduleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final Random random = new Random();

    public DataSeeder(StationRepository stationRepository, TrainRepository trainRepository,
            TrainScheduleRepository trainScheduleRepository, UserRepository userRepository,
            PasswordEncoder passwordEncoder) {
        this.stationRepository = stationRepository;
        this.trainRepository = trainRepository;
        this.trainScheduleRepository = trainScheduleRepository;
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // ALWAYS reset admin password to 'admin' to ensure access
        resetAdminCredentials();

        if (stationRepository.count() < 105) { // Check if already seeded including test data (30 + 4 = 34 stations? no
                                               // wait 30)
            // Actually just check if STA exists
            if (stationRepository.findAll().stream().noneMatch(s -> s.getStationCode().equals("STA"))) {
                seedIndirectRouteTest();
            }
        }

        if (stationRepository.count() == 0) {
            seedStations();
            System.out.println("Station seeding complete.");
        }

        if (trainRepository.count() == 0) {
            seedTrainsAndSchedules();
            System.out.println("Train and Schedule seeding complete.");
        }

        System.out.println("DATA SEEDING ENABLED. Checking Users...");

        System.out.println("DATA SEEDING CHECK COMPLETE!");
        seedUsers();
    }

    private void resetAdminCredentials() {
        try {
            User admin = userRepository.findByUsername("admin").orElse(null);
            if (admin != null) {
                admin.setPassword(passwordEncoder.encode("admin"));
                admin.setRole("ADMIN"); // Force role update
                userRepository.save(admin);
                System.out.println("Admin password reset to 'admin' and role confirmed as 'ADMIN'");
            }
        } catch (Exception e) {
            System.out.println("Failed to reset admin password: " + e.getMessage());
        }
    }

    private void seedIndirectRouteTest() {
        System.out.println("Seeding Indirect Route Test Data (A,B,C,D)...");
        Station s1 = createStation("STA", "Station A", "City A", 10.0, 10.0);
        Station s2 = createStation("STB", "Station B", "City B", 11.0, 11.0);
        Station s3 = createStation("STC", "Station C", "City C", 12.0, 12.0);
        Station s4 = createStation("STD", "Station D", "City D", 13.0, 13.0);

        // T1: A -> B
        // T1: A -> B
        Train t1 = createTrain("90001", "Link A-B", 60);
        createSchedule(t1, s1, LocalTime.of(8, 0), LocalTime.of(8, 0), 1, 0);
        createSchedule(t1, s2, LocalTime.of(10, 0), LocalTime.of(10, 0), 2, 100);

        // T2: B -> C (2h layover at B: Arr 10:00, Dep 12:00)
        // T2: B -> C (2h layover at B: Arr 10:00, Dep 12:00)
        Train t2 = createTrain("90002", "Link B-C", 60);
        createSchedule(t2, s2, LocalTime.of(12, 0), LocalTime.of(12, 0), 1, 0);
        createSchedule(t2, s3, LocalTime.of(14, 0), LocalTime.of(14, 0), 2, 100);

        // T3: C -> D (2h layover at C: Arr 14:00, Dep 16:00)
        // T3: C -> D (2h layover at C: Arr 14:00, Dep 16:00)
        Train t3 = createTrain("90003", "Link C-D", 60);
        createSchedule(t3, s3, LocalTime.of(16, 0), LocalTime.of(16, 0), 1, 0);
        createSchedule(t3, s4, LocalTime.of(18, 0), LocalTime.of(18, 0), 2, 100);

        // T4: D -> A (2h layover at D: Arr 18:00, Dep 20:00)
        // T4: D -> A (2h layover at D: Arr 18:00, Dep 20:00)
        Train t4 = createTrain("90004", "Link D-A", 60);
        createSchedule(t4, s4, LocalTime.of(20, 0), LocalTime.of(20, 0), 1, 0);
        createSchedule(t4, s1, LocalTime.of(22, 0), LocalTime.of(22, 0), 2, 100);

        System.out.println("Test Data Seeded: Trains 90001-90004");
    }

    private void seedUsers() {
        // Always seed admin user if not exists
        // Always seed admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User();
            admin.setUsername("admin");
            admin.setPassword(passwordEncoder.encode("admin"));
            admin.setRole("ADMIN");
            admin.setEmail("admin@example.com");
            admin.setFullName("Admin User");
            userRepository.save(admin);
            System.out.println("Created admin user");
        }

        // Seed regular user if not exists
        // Seed regular user if not exists
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

    private void seedStations() {
        List<Station> stations = new ArrayList<>();
        // 30 Major Karnataka Stations
        stations.add(createStationObj("SBC", "KSR Bengaluru", "Bengaluru", 12.9716, 77.5946));
        stations.add(createStationObj("MYS", "Mysuru Jn", "Mysuru", 12.3118, 76.6548));
        stations.add(createStationObj("UBL", "Hubballi Jn", "Hubballi", 15.3647, 75.1240));
        stations.add(createStationObj("MAQ", "Mangaluru Ctrl", "Mangaluru", 12.8700, 74.8800)); // Approx
        stations.add(createStationObj("KAWR", "Karwar", "Karwar", 14.8200, 74.1300));
        stations.add(createStationObj("TK", "Tumakuru", "Tumakuru", 13.3300, 77.1000));
        stations.add(createStationObj("ASK", "Arsikere Jn", "Arsikere", 13.3100, 76.2500));
        stations.add(createStationObj("DVG", "Davangere", "Davangere", 14.4600, 75.9200));
        stations.add(createStationObj("HRR", "Harihar", "Harihar", 14.5100, 75.8000));
        stations.add(createStationObj("HVR", "Haveri", "Haveri", 14.7900, 75.4000));
        stations.add(createStationObj("BGM", "Belagavi", "Belagavi", 15.8497, 74.4977));
        stations.add(createStationObj("BAY", "Ballari Jn", "Ballari", 15.1394, 76.9214));
        stations.add(createStationObj("HPT", "Hosapete Jn", "Hosapete", 15.2689, 76.3909));
        stations.add(createStationObj("GDG", "Gadag Jn", "Gadag", 15.4200, 75.6200));
        stations.add(createStationObj("BJP", "Vijayapura", "Vijayapura", 16.8302, 75.7100));
        stations.add(createStationObj("GR", "Kalaburagi", "Kalaburagi", 17.3297, 76.8343));
        stations.add(createStationObj("WADI", "Wadi Jn", "Wadi", 17.0500, 76.9800));
        stations.add(createStationObj("RC", "Raichur", "Raichur", 16.2000, 77.3600));
        stations.add(createStationObj("BSK", "Basavakalyan", "Basavakalyan", 17.8700, 76.9500)); // Approx
        stations.add(createStationObj("BIDR", "Bidar", "Bidar", 17.9100, 77.5000));
        stations.add(createStationObj("HAS", "Hassan Jn", "Hassan", 13.0000, 76.1000));
        stations.add(createStationObj("SKLR", "Sakleshpur", "Sakleshpur", 12.9400, 75.7800));
        stations.add(createStationObj("SBHR", "Subrahmanya Rd", "Subrahmanya", 12.6600, 75.5600));
        stations.add(createStationObj("UD", "Udupi", "Udupi", 13.3400, 74.7400));
        stations.add(createStationObj("KUDA", "Kundapura", "Kundapura", 13.6200, 74.6900));
        stations.add(createStationObj("BTJL", "Bhatkal", "Bhatkal", 13.9600, 74.5600));
        stations.add(createStationObj("GOK", "Gokarna Rd", "Gokarna", 14.5400, 74.3100));
        stations.add(createStationObj("KTY", "Kotturu", "Kotturu", 14.8100, 76.2200));
        stations.add(createStationObj("CTA", "Chitradurga", "Chitradurga", 14.2200, 76.4000));
        stations.add(createStationObj("RRB", "Birur Jn", "Birur", 13.6200, 75.9600));

        stationRepository.saveAll(stations);
    }

    private void seedTrainsAndSchedules() {
        // Fetch saved stations for reference
        List<Station> allStations = stationRepository.findAll();
        Station sbc = findStn(allStations, "SBC");
        Station ubl = findStn(allStations, "UBL");
        Station maw = findStn(allStations, "MAQ");
        Station kawr = findStn(allStations, "KAWR");
        Station klbg = findStn(allStations, "GR");
        Station has = findStn(allStations, "HAS");
        Station tk = findStn(allStations, "TK");

        // LOOP A: Intercity Expresses (SBC -> UBL) - 20 Trains
        List<Station> routeA = Arrays.asList(sbc, tk, findStn(allStations, "ASK"), findStn(allStations, "DVG"),
                findStn(allStations, "HVR"), ubl);
        generateLoop("INT-A", 20, 6, routeA, 60); // Start 6:00, 20 trains

        // LOOP B: Coastal Connectors (SBC -> KAWR via HAS, MAQ) - 15 Trains
        List<Station> routeB = Arrays.asList(sbc, has, findStn(allStations, "SKLR"), findStn(allStations, "UD"),
                kawr);
        generateLoop("CST-B", 15, 5, routeB, 45);

        // LOOP C: Northern Links (UBL -> KLBG via GDG, BAY) - 15 Trains
        List<Station> routeC = Arrays.asList(ubl, findStn(allStations, "GDG"), findStn(allStations, "HPT"),
                findStn(allStations, "BAY"), findStn(allStations, "RC"), klbg);
        generateLoop("NTH-C", 15, 7, routeC, 55);

        // LOOP D: Short Hops (Random) - 50 Trains
        generateShortHops(allStations, 50);
    }

    private void generateLoop(String prefix, int count, int startHour, List<Station> route, int avgSpeed) {
        for (int i = 0; i < count; i++) {
            String number = String.format("1%04d", random.nextInt(9000));
            String name = prefix + " Express " + (i + 1);
            Train train = createTrain(number, name, 60);

            int departureHour = (startHour + i) % 24; // Stagger by 1 hour
            LocalTime currentTime = LocalTime.of(departureHour, 0);
            int distance = 0;

            for (int j = 0; j < route.size(); j++) {
                Station currentStn = route.get(j);

                // Calc time from previous
                if (j > 0) {
                    Station prevStn = route.get(j - 1);
                    // Approx distance from Lat/Long (Rough calc: 1 deg ~ 111km)
                    double distLeg = calculateDistance(prevStn, currentStn);
                    distance += (int) distLeg;
                    int minutes = (int) ((distLeg / avgSpeed) * 60);
                    currentTime = currentTime.plusMinutes(minutes);
                }

                LocalTime arrival = currentTime;
                LocalTime departure = (j == route.size() - 1) ? null : currentTime.plusMinutes(5); // 5 min halt

                if (departure != null)
                    currentTime = departure; // Update current time to departure

                createSchedule(train, currentStn, arrival, departure == null ? arrival : departure, j + 1, distance);
            }
        }
    }

    private void generateShortHops(List<Station> allStations, int count) {
        for (int i = 0; i < count; i++) {
            // Pick rand start and end
            Station start = allStations.get(random.nextInt(allStations.size()));
            Station end = allStations.get(random.nextInt(allStations.size()));
            while (start.getStationId().equals(end.getStationId()) || calculateDistance(start, end) > 300) {
                end = allStations.get(random.nextInt(allStations.size())); // Keep hops < 300km
            }

            String number = String.format("0%04d", random.nextInt(9000));
            String name = "Pass-" + start.getStationCode() + "-" + end.getStationCode();
            Train train = createTrain(number, name, 40);

            LocalTime time = LocalTime.of(random.nextInt(14) + 6, random.nextInt(60)); // 6am to 8pm start
            int dist = (int) calculateDistance(start, end);
            int mins = (int) ((dist / 40.0) * 60); // Slow passenger train

            createSchedule(train, start, time, time.plusMinutes(2), 1, 0);
            createSchedule(train, end, time.plusMinutes(mins), time.plusMinutes(mins), 2, dist);
        }
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
        // Default seats? Or not needed
        trainScheduleRepository.save(ts);
    }

    private Station createStation(String code, String name, String city, double lat, double lng) {
        Station s = new Station();
        s.setStationCode(code);
        s.setStationName(name);
        s.setCity(city);
        s.setLatitude(lat);
        s.setLongitude(lng);
        return stationRepository.save(s);
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

    private Train createTrain(String number, String name, int seats) {
        Train t = new Train();
        t.setTrainNumber(number);
        t.setTrainName(name);
        t.setTotalSeatsPerCoach(seats);
        t.setNumberOfCoaches(10); // Default
        t.setPrice(100L); // Default
        return trainRepository.save(t);
    }

    private Station findStn(List<Station> stations, String code) {
        return stations.stream().filter(s -> s.getStationCode().equals(code)).findFirst().orElseThrow();
    }

    // Haversine-ish or simple Euclidean for seeding
    private double calculateDistance(Station s1, Station s2) {
        double latDiff = s1.getLatitude() - s2.getLatitude();
        double lngDiff = s1.getLongitude() - s2.getLongitude();
        // Approx conversion for Karnataka/India lat
        double latKm = latDiff * 111;
        double lngKm = lngDiff * 111 * Math.cos(Math.toRadians(s1.getLatitude()));
        return Math.sqrt(latKm * latKm + lngKm * lngKm);
    }
}
