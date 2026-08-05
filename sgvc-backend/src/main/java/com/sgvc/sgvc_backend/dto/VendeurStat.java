package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

// Classement d'un vendeur (top vendeurs du mois)
@Data
@AllArgsConstructor
public class VendeurStat {
    private Long vendeurId;
    private String nomComplet;
    private BigDecimal montantVentes;
    private long nbBons;
}
