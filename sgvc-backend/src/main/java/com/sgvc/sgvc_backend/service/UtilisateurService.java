package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.dto.CreateUtilisateurRequest;
import com.sgvc.sgvc_backend.dto.UpdateUtilisateurRequest;
import com.sgvc.sgvc_backend.dto.UtilisateurResponse;
import com.sgvc.sgvc_backend.entity.Role;
import com.sgvc.sgvc_backend.entity.Utilisateur;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.mapper.UtilisateurMapper;
import com.sgvc.sgvc_backend.repository.RoleRepository;
import com.sgvc.sgvc_backend.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
public class UtilisateurService {

    private final UtilisateurRepository utilisateurRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UtilisateurService(UtilisateurRepository utilisateurRepository,
            RoleRepository roleRepository,
            PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public List<UtilisateurResponse> getAllUtilisateurs() {
        return UtilisateurMapper.toResponseList(utilisateurRepository.findAll());
    }

    public List<UtilisateurResponse> rechercher(String q) {
        return UtilisateurMapper.toResponseList(
                utilisateurRepository.findByNomContainingIgnoreCaseOrEmailContainingIgnoreCase(q, q));
    }

    public UtilisateurResponse getUtilisateurById(Long id) {
        return UtilisateurMapper.toResponse(getUtilisateurEntity(id));
    }

    @Transactional
    public UtilisateurResponse createUtilisateur(CreateUtilisateurRequest request) {
        if (utilisateurRepository.existsByEmail(request.getEmail())) {
            throw new ConflictException("Un utilisateur avec cet email existe déjà : " + request.getEmail());
        }

        Utilisateur utilisateur = new Utilisateur();
        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        utilisateur.setActif(true);
        utilisateur.setRoles(chargerRoles(request.getRoleIds()));

        return UtilisateurMapper.toResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public UtilisateurResponse updateUtilisateur(Long id, UpdateUtilisateurRequest request) {
        Utilisateur utilisateur = getUtilisateurEntity(id);

        // Vérifier que l'email n'est pas déjà pris par un AUTRE utilisateur
        utilisateurRepository.findByEmail(request.getEmail())
                .filter(autre -> !autre.getId().equals(id))
                .ifPresent(autre -> {
                    throw new ConflictException("Un utilisateur avec cet email existe déjà : " + request.getEmail());
                });

        utilisateur.setNom(request.getNom());
        utilisateur.setEmail(request.getEmail());
        utilisateur.setActif(request.isActif());

        // Mot de passe optionnel : vide = inchangé
        if (request.getMotDePasse() != null && !request.getMotDePasse().isBlank()) {
            utilisateur.setMotDePasse(passwordEncoder.encode(request.getMotDePasse()));
        }

        // Mise à jour des rôles
        if (request.getRoleIds() != null) {
            utilisateur.setRoles(chargerRoles(request.getRoleIds()));
        }

        return UtilisateurMapper.toResponse(utilisateurRepository.save(utilisateur));
    }

    @Transactional
    public void deleteUtilisateur(Long id) {
        Utilisateur utilisateur = getUtilisateurEntity(id);
        utilisateurRepository.delete(utilisateur);
    }

    private Utilisateur getUtilisateurEntity(Long id) {
        return utilisateurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Utilisateur introuvable avec l'id : " + id));
    }

    private Set<Role> chargerRoles(List<Long> roleIds) {
        Set<Role> roles = new HashSet<>();
        for (Long roleId : roleIds) {
            Role role = roleRepository.findById(roleId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rôle introuvable avec l'id : " + roleId));
            roles.add(role);
        }
        return roles;
    }
}
