package com.sgvc.sgvc_backend.config;

import com.sgvc.sgvc_backend.entity.Role;
import com.sgvc.sgvc_backend.repository.RoleRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;

    public DataInitializer(RoleRepository roleRepository) {
        this.roleRepository = roleRepository;
    }

    @Override
    public void run(String... args) {
        creerRoleSiAbsent("ADMIN");
        creerRoleSiAbsent("MANAGER");
        creerRoleSiAbsent("VENDEUR");
        creerRoleSiAbsent("CAISSIER");
    }

    private void creerRoleSiAbsent(String nomRole) {
        if (!roleRepository.existsByNom(nomRole)) {
            Role role = new Role();
            role.setNom(nomRole);
            roleRepository.save(role);
        }
    }
}