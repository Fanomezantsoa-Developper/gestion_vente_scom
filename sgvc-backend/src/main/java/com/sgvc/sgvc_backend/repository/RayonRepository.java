package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Rayon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface RayonRepository extends JpaRepository<Rayon, Long> {

    // Méthode personnalisée : Spring Data JPA génère automatiquement
    // le code SQL juste à partir du nom de la méthode !
    Optional<Rayon> findByNom(String nom);

    boolean existsByNom(String nom);

    // Recherche par nom (insensible à la casse)
    List<Rayon> findByNomContainingIgnoreCase(String nom);
}