package com.sgvc.sgvc_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "paiements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Paiement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private LocalDateTime datePaiement = LocalDateTime.now();

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montant;

    @Column(nullable = false, length = 20)
    private String modePaiement; // ESPECES, CARTE, MOBILE, CHEQUE

    @Column(nullable = false, length = 20)
    private String statut = "PAYE"; // PAYE, ANNULE

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bon_commande_id", nullable = false, unique = true)
    private BonCommande bonCommande;
}