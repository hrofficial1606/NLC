package com.nlc.backend.config;

import com.nlc.backend.entity.Role;
import com.nlc.backend.entity.User;
import com.nlc.backend.entity.enums.AuthProvider;
import com.nlc.backend.entity.enums.RoleType;
import com.nlc.backend.repository.RoleRepository;
import com.nlc.backend.repository.UserRepository;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        Role adminRole = roleRepository.findByName(RoleType.ADMIN).orElseGet(() -> {
            Role role = new Role();
            role.setName(RoleType.ADMIN);
            return roleRepository.save(role);
        });

        Role userRole = roleRepository.findByName(RoleType.USER).orElseGet(() -> {
            Role role = new Role();
            role.setName(RoleType.USER);
            return roleRepository.save(role);
        });

        userRepository.findByEmailIgnoreCase("admin@nlc.local").orElseGet(() -> {
            User admin = new User();
            admin.setFullName("NLC Admin");
            admin.setEmail("admin@nlc.local");
            admin.setPhoneNumber("9999999999");
            admin.setPassword(passwordEncoder.encode("Admin@123"));
            admin.setProvider(AuthProvider.LOCAL);
            admin.setEmailVerified(true);
            admin.setRoles(Set.of(adminRole, userRole));
            return userRepository.save(admin);
        });
    }
}
