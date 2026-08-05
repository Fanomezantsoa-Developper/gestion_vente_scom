package com.sgvc.sgvc_backend.config;

import com.sgvc.sgvc_backend.entity.Role;
import com.sgvc.sgvc_backend.entity.Utilisateur;
import com.sgvc.sgvc_backend.repository.RoleRepository;
import com.sgvc.sgvc_backend.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Set;

@Component
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;

    public DataInitializer(RoleRepository roleRepository,
            UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder) {
        this.roleRepository = roleRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) {
        Role admin = creerRoleSiAbsent("ADMIN");
        creerRoleSiAbsent("MANAGER");
        creerRoleSiAbsent("VENDEUR");
        creerRoleSiAbsent("CAISSIER");

        // Sur une base neuve, créer un compte administrateur pour pouvoir se connecter
        if (utilisateurRepository.count() == 0) {
            Utilisateur adminUser = new Utilisateur();
            adminUser.setNom("Administrateur");
            adminUser.setEmail("admin@sgvc.mg");
            adminUser.setMotDePasse(passwordEncoder.encode("admin123"));
            adminUser.setActif(true);
            adminUser.setRoles(Set.of(admin));
            utilisateurRepository.save(adminUser);
        }
    }

    private Role creerRoleSiAbsent(String nomRole) {
        return roleRepository.findByNom(nomRole)
                .orElseGet(() -> {
                    Role role = new Role();
                    role.setNom(nomRole);
                    return roleRepository.save(role);
                });
    }
}
