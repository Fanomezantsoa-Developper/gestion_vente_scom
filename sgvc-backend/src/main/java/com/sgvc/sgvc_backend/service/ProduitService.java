package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Produit;
import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.repository.ProduitRepository;
import com.sgvc.sgvc_backend.repository.RayonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ProduitService {

    private final ProduitRepository produitRepository;
    private final RayonRepository rayonRepository;

    @Autowired
    public ProduitService(ProduitRepository produitRepository, RayonRepository rayonRepository) {
        this.produitRepository = produitRepository;
        this.rayonRepository = rayonRepository;
    }

    public List<Produit> getAllProduits() {
        return produitRepository.findAll();
    }

    public Produit getProduitById(Long id) {
        return produitRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Produit introuvable avec l'id : " + id));
    }

    public List<Produit> getProduitsByRayon(Long rayonId) {
        return produitRepository.findByRayonId(rayonId);
    }

    public List<Produit> getProduitsStockFaible(Integer seuil) {
        return produitRepository.findByStockLessThan(seuil);
    }

    public Produit createProduit(Produit produit) {
        if (produit.getReference() != null && produitRepository.existsByReference(produit.getReference())) {
            throw new RuntimeException("Un produit avec cette référence existe déjà : " + produit.getReference());
        }

        Long rayonId = produit.getRayon().getId();
        Rayon rayon = rayonRepository.findById(rayonId)
                .orElseThrow(() -> new RuntimeException("Rayon introuvable avec l'id : " + rayonId));

        produit.setRayon(rayon);
        return produitRepository.save(produit);
    }

    public Produit updateProduit(Long id, Produit produitDetails) {
        Produit produit = getProduitById(id);
        produit.setNom(produitDetails.getNom());
        produit.setReference(produitDetails.getReference());
        produit.setPrix(produitDetails.getPrix());
        produit.setStock(produitDetails.getStock());
        produit.setDescription(produitDetails.getDescription());

        if (produitDetails.getRayon() != null) {
            Long rayonId = produitDetails.getRayon().getId();
            Rayon rayon = rayonRepository.findById(rayonId)
                    .orElseThrow(() -> new RuntimeException("Rayon introuvable avec l'id : " + rayonId));
            produit.setRayon(rayon);
        }

        return produitRepository.save(produit);
    }

    public void deleteProduit(Long id) {
        Produit produit = getProduitById(id);
        produitRepository.delete(produit);
    }
}