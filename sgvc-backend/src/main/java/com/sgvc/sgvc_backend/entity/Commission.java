package com.sgvc.sgvc_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "commissions", uniqueConstraints = @UniqueConstraint(columnNames = { "vendeur_id", "mois", "annee" }))
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Commission {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Integer mois; // 1-12

    @Column(nullable = false)
    private Integer annee;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montantVentes;

    @Column(nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxCommission = BigDecimal.valueOf(5); // 5% par défaut

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal montantCommission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vendeur_id", nullable = false)
    private Vendeur vendeur;
}