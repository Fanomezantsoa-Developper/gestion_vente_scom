package com.sgvc.sgvc_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "produits")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Produit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String nom;

    @Column(unique = true, length = 50)
    private String reference;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal prix;

    @Column(nullable = false)
    private Integer stock;

    @Column(length = 255)
    private String description;

    // Relation : plusieurs produits appartiennent à un seul rayon
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rayon_id", nullable = false)
    private Rayon rayon;
}