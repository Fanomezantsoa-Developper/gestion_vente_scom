package com.sgvc.sgvc_backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "vendeurs")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Vendeur {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String nom;

    @Column(nullable = false, length = 100)
    private String prenom;

    @Column(unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telephone;

    // Relation : plusieurs vendeurs appartiennent à un seul rayon
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rayon_id", nullable = false)
    private Rayon rayon;
}