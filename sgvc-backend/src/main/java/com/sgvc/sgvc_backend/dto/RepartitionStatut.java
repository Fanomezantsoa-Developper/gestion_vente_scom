package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

// Nombre de bons de commande par statut (dont PAYE calculé)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class RepartitionStatut {
    private String statut; // EN_ATTENTE, VALIDE, ANNULE, PAYE
    private long nombre;
}
