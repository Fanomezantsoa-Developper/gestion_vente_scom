package com.sgvc.sgvc_backend.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank(message = "Le nom est obligatoire")
    @Size(max = 100, message = "Le nom ne doit pas dépasser 100 caractères")
    @Column(nullable = false, length = 100)
    private String nom;

    @NotBlank(message = "Le prénom est obligatoire")
    @Size(max = 100, message = "Le prénom ne doit pas dépasser 100 caractères")
    @Column(nullable = false, length = 100)
    private String prenom;

    @Email(message = "L'email doit être valide")
    @Column(unique = true, length = 150)
    private String email;

    @Column(length = 20)
    private String telephone;

    // Relation : plusieurs vendeurs appartiennent à un seul rayon
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "rayon_id", nullable = false)
    private Rayon rayon;
}