package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.BonCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonCommandeRepository extends JpaRepository<BonCommande, Long> {
    List<BonCommande> findByVendeurId(Long vendeurId);

    List<BonCommande> findByClientId(Long clientId);

    List<BonCommande> findByStatut(String statut);

    // Recherche par nom/prénom du vendeur OU du client (insensible à la casse)
    @Query("""
            SELECT b FROM BonCommande b
            JOIN b.vendeur v
            JOIN b.client c
            WHERE LOWER(v.nom) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(v.prenom) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(c.nom) LIKE LOWER(CONCAT('%', :q, '%'))
               OR LOWER(c.prenom) LIKE LOWER(CONCAT('%', :q, '%'))
            """)
    List<BonCommande> rechercher(@Param("q") String q);
}