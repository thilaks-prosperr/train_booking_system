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
        if (stationRepository.count() == 0) {
            seedStations();
            seedTrainsAndSchedules();
            System.out.println("FULL SCALE DATA SEEDING COMPLETE!");
        }
        seedUsers();
    }

    private void seedUsers() {
        // Always seed admin user if not exists
        if (!userRepository.existsByUsername("admin")) {
            User admin = new User(null, "admin", passwordEncoder.encode("admin"), "ADMIN", "admin@example.com",
                    "Admin User");
            userRepository.save(admin);
            System.out.println("Created admin user");
        }

        // Seed regular user if not exists
        if (!userRepository.existsByUsername("user")) {
            User user = new User(null, "user", passwordEncoder.encode("password"), "USER", "user@example.com",
                    "Test User");
            userRepository.save(user);
            System.out.println("Created regular user");
        }
    }

    private void seedStations() {
        List<Station> stations = new ArrayList<>();
        // 30 Major Karnataka Stations
        stations.add(new Station(null, "SBC", "KSR Bengaluru", "Bengaluru", 12.9716, 77.5946));
        stations.add(new Station(null, "MYS", "Mysuru Jn", "Mysuru", 12.3118, 76.6548));
        stations.add(new Station(null, "UBL", "Hubballi Jn", "Hubballi", 15.3647, 75.1240));
        stations.add(new Station(null, "MAQ", "Mangaluru Ctrl", "Mangaluru", 12.8700, 74.8800)); // Approx
        stations.add(new Station(null, "KAWR", "Karwar", "Karwar", 14.8200, 74.1300));
        stations.add(new Station(null, "TK", "Tumakuru", "Tumakuru", 13.3300, 77.1000));
        stations.add(new Station(null, "ASK", "Arsikere Jn", "Arsikere", 13.3100, 76.2500));
        stations.add(new Station(null, "DVG", "Davangere", "Davangere", 14.4600, 75.9200));
        stations.add(new Station(null, "HRR", "Harihar", "Harihar", 14.5100, 75.8000));
        stations.add(new Station(null, "HVR", "Haveri", "Haveri", 14.7900, 75.4000));
        stations.add(new Station(null, "BGM", "Belagavi", "Belagavi", 15.8497, 74.4977));
        stations.add(new Station(null, "BAY", "Ballari Jn", "Ballari", 15.1394, 76.9214));
        stations.add(new Station(null, "HPT", "Hosapete Jn", "Hosapete", 15.2689, 76.3909));
        stations.add(new Station(null, "GDG", "Gadag Jn", "Gadag", 15.4200, 75.6200));
        stations.add(new Station(null, "BJP", "Vijayapura", "Vijayapura", 16.8302, 75.7100));
        stations.add(new Station(null, "GR", "Kalaburagi", "Kalaburagi", 17.3297, 76.8343));
        stations.add(new Station(null, "WADI", "Wadi Jn", "Wadi", 17.0500, 76.9800));
        stations.add(new Station(null, "RC", "Raichur", "Raichur", 16.2000, 77.3600));
        stations.add(new Station(null, "BSK", "Basavakalyan", "Basavakalyan", 17.8700, 76.9500)); // Approx
        stations.add(new Station(null, "BIDR", "Bidar", "Bidar", 17.9100, 77.5000));
        stations.add(new Station(null, "HAS", "Hassan Jn", "Hassan", 13.0000, 76.1000));
        stations.add(new Station(null, "SKLR", "Sakleshpur", "Sakleshpur", 12.9400, 75.7800));
        stations.add(new Station(null, "SBHR", "Subrahmanya Rd", "Subrahmanya", 12.6600, 75.5600));
        stations.add(new Station(null, "UD", "Udupi", "Udupi", 13.3400, 74.7400));
        stations.add(new Station(null, "KUDA", "Kundapura", "Kundapura", 13.6200, 74.6900));
        stations.add(new Station(null, "BTJL", "Bhatkal", "Bhatkal", 13.9600, 74.5600));
        stations.add(new Station(null, "GOK", "Gokarna Rd", "Gokarna", 14.5400, 74.3100));
        stations.add(new Station(null, "KTY", "Kotturu", "Kotturu", 14.8100, 76.2200));
        stations.add(new Station(null, "CTA", "Chitradurga", "Chitradurga", 14.2200, 76.4000));
        stations.add(new Station(null, "RRB", "Birur Jn", "Birur", 13.6200, 75.9600));

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
            Train train = new Train(null, number, name, 60); // 60 seats/coach
            train = trainRepository.save(train);

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
            Train train = new Train(null, number, name, 40);
            train = trainRepository.save(train);

            LocalTime time = LocalTime.of(random.nextInt(14) + 6, random.nextInt(60)); // 6am to 8pm start
            int dist = (int) calculateDistance(start, end);
            int mins = (int) ((dist / 40.0) * 60); // Slow passenger train

            createSchedule(train, start, time, time.plusMinutes(2), 1, 0);
            createSchedule(train, end, time.plusMinutes(mins), time.plusMinutes(mins), 2, dist);
        }
    }

    private void createSchedule(Train train, Station station, LocalTime arrival, LocalTime departure, int seq,
            int distance) {
        TrainSchedule ts = new TrainSchedule(null, train, station, arrival, departure, seq, distance);
        trainScheduleRepository.save(ts);
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
