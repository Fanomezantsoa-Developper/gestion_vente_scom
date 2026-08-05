package com.sgvc.sgvc_backend.dto;

import lombok.AllArgsConstructor;
import lombok.Data;

import java.math.BigDecimal;

// Indicateurs principaux du tableau de bord
@Data
@AllArgsConstructor
public class DashboardStats {
    private long nbRayons;
    private long nbVendeurs;
    private long nbClients;
    private long nbProduits;
    private long nbBons;
    private long nbBonsEnAttente;
    private long nbPaiements;
    private long nbProduitsStockFaible;
    private BigDecimal montantTotalVentes; // somme des bons VALIDES
    private BigDecimal montantTotalCommissions;
}
