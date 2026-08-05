package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

// Ventes réalisées pour un mois donné (graphique annuel)
@Data
@AllArgsConstructor
public class VenteParMois {
    private int mois;
    private BigDecimal montant;
}
