package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Paiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaiementRepository extends JpaRepository<Paiement, Long> {
    Optional<Paiement> findByBonCommandeId(Long bonCommandeId);
}