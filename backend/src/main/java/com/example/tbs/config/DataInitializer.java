package com.example.tbs.config;

import com.example.tbs.entity.User;
import com.example.tbs.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) throws Exception {
        // Ensure "admin" user exists with ROLE "ADMIN"
        String username = "admin";

        User adminUser = userRepository.findByUsername(username).orElse(null);

        if (adminUser == null) {
            adminUser = new User();
            adminUser.setUsername(username);
            adminUser.setPassword(passwordEncoder.encode("admin123")); // Default password
            adminUser.setEmail("admin@example.com");
            adminUser.setFullName("System Admin");
            adminUser.setRole("ADMIN");
            userRepository.save(adminUser);
            System.out.println("Created new ADMIN user: " + username);
        } else {
            // Force update role to ADMIN if not already
            if (!"ADMIN".equals(adminUser.getRole())) {
                adminUser.setRole("ADMIN");
                userRepository.save(adminUser);
                System.out.println("Updated existing user " + username + " to ADMIN role.");
            }
        }
    }
}
