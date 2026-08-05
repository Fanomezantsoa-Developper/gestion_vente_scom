package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

// Montant des ventes validées regroupé par rayon
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VenteParRayon {
    private Long rayonId;
    private String nom;
    private BigDecimal montant;
}
