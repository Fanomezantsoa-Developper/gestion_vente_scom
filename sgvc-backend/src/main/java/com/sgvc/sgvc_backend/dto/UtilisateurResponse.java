package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.util.List;

// Réponse de l'API : JAMAIS de motDePasse ici
@Data
@AllArgsConstructor
public class UtilisateurResponse {
    private Long id;
    private String nom;
    private String email;
    private boolean actif;
    private List<String> roles;
}
