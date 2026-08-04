package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.BonCommande;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BonCommandeRepository extends JpaRepository<BonCommande, Long> {
    List<BonCommande> findByVendeurId(Long vendeurId);

    List<BonCommande> findByClientId(Long clientId);

    List<BonCommande> findByStatut(String statut);
}