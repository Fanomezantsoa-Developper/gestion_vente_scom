package com.sgvc.sgvc_backend.mapper;

import com.sgvc.sgvc_backend.dto.UtilisateurResponse;
import com.sgvc.sgvc_backend.entity.Utilisateur;
import com.sgvc.sgvc_backend.entity.Role;

import java.util.List;

// Conversion entre l'entité JPA et le DTO renvoyé par l'API.
// Garantit qu'aucun champ sensible (motDePasse) ne sort de l'application.
public class UtilisateurMapper {

    private UtilisateurMapper() {
    }

    public static UtilisateurResponse toResponse(Utilisateur utilisateur) {
        List<String> nomsRoles = utilisateur.getRoles().stream()
                .map(Role::getNom)
                .toList();
        return new UtilisateurResponse(
                utilisateur.getId(),
                utilisateur.getNom(),
                utilisateur.getEmail(),
                utilisateur.isActif(),
                nomsRoles);
    }

    public static List<UtilisateurResponse> toResponseList(List<Utilisateur> utilisateurs) {
        return utilisateurs.stream()
                .map(UtilisateurMapper::toResponse)
                .toList();
    }
}
