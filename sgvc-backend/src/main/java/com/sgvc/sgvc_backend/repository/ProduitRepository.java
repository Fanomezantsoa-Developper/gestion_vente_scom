package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Produit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProduitRepository extends JpaRepository<Produit, Long> {

    Optional<Produit> findByReference(String reference);

    boolean existsByReference(String reference);

    List<Produit> findByRayonId(Long rayonId);

    // Bonus : trouver les produits en stock faible (utile pour le dashboard)
    List<Produit> findByStockLessThan(Integer seuil);
}