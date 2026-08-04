package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Vendeur;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VendeurRepository extends JpaRepository<Vendeur, Long> {

    Optional<Vendeur> findByEmail(String email);

    boolean existsByEmail(String email);

    // Méthode utile pour la logique métier : trouver tous les vendeurs d'un rayon
    // donné
    List<Vendeur> findByRayonId(Long rayonId);
}