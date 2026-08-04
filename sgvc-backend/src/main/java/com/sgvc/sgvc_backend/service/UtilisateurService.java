package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Role;
import com.sgvc.sgvc_backend.entity.Utilisateur;
import com.sgvc.sgvc_backend.repository.RoleRepository;
import com.sgvc.sgvc_backend.repository.UtilisateurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public UtilisateurService(UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }

    public Utilisateur getUtilisateurById(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur introuvable avec l'id : " + id));
    }

    public Utilisateur createUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByEmail(utilisateur.getEmail())) {
            throw new RuntimeException("Un utilisateur avec cet email existe déjà : " + utilisateur.getEmail());
        }

        utilisateur.setMotDePasse(passwordEncoder.encode(utilisateur.getMotDePasse()));

        Set<Role> rolesComplets = new HashSet<>();
        for (Role role : utilisateur.getRoles()) {
            Role roleTrouve = roleRepository.findById(role.getId())
                    .orElseThrow(() -> new RuntimeException("Rôle introuvable avec l'id : " + role.getId()));
            rolesComplets.add(roleTrouve);
        }
        utilisateur.setRoles(rolesComplets);

        return utilisateurRepository.save(utilisateur);
    }

    public Utilisateur updateUtilisateur(Long id, Utilisateur utilisateurDetails) {
        Utilisateur utilisateur = getUtilisateurById(id);
        utilisateur.setNom(utilisateurDetails.getNom());
        utilisateur.setEmail(utilisateurDetails.getEmail());
        utilisateur.setActif(utilisateurDetails.isActif());

        if (utilisateurDetails.getMotDePasse() != null && !utilisateurDetails.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(utilisateurDetails.getMotDePasse()));
        }

        return utilisateurRepository.save(utilisateur);
    }

    public void deleteUtilisateur(Long id) {
        Utilisateur utilisateur = getUtilisateurById(id);
        utilisateurRepository.delete(utilisateur);
    }
}