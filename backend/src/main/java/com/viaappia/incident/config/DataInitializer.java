package com.viaappia.incident.config;

import com.viaappia.incident.entity.Role;
import com.viaappia.incident.entity.User;
import com.viaappia.incident.entity.enums.RoleName;
import com.viaappia.incident.repository.RoleRepository;
import com.viaappia.incident.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * Initializes essential seed data required by the application.
 */
@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private static final String ADMIN_EMAIL = "admin@viaappia.com";
    private static final String ADMIN_PASSWORD = "Admin@123";

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * Ensures default roles and admin user exist after application startup.
     */
    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(RoleName.ROLE_ADMIN)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleName.ROLE_ADMIN).build()
                ));

        roleRepository.findByName(RoleName.ROLE_USER)
                .orElseGet(() -> roleRepository.save(
                        Role.builder().name(RoleName.ROLE_USER).build()
                ));

        if (!userRepository.existsByEmail(ADMIN_EMAIL)) {
            User admin = User.builder()
                    .name("Via Appia Admin")
                    .email(ADMIN_EMAIL)
                    .passwordHash(passwordEncoder.encode(ADMIN_PASSWORD))
                    .active(true)
                    .roles(Set.of(adminRole))
                    .build();

            userRepository.save(admin);
        }
    }
}