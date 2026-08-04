package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.*;
import com.sgvc.sgvc_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BonCommandeService {

    private final BonCommandeRepository bonCommandeRepository;
    private final VendeurRepository vendeurRepository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;

    @Autowired
    public BonCommandeService(BonCommandeRepository bonCommandeRepository,
            VendeurRepository vendeurRepository,
            ClientRepository clientRepository,
            ProduitRepository produitRepository) {
        this.bonCommandeRepository = bonCommandeRepository;
        this.vendeurRepository = vendeurRepository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
    }

    public List<BonCommande> getAllBons() {
        return bonCommandeRepository.findAll();
    }

    public BonCommande getBonById(Long id) {
        return bonCommandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Bon introuvable avec l'id : " + id));
    }

    public List<BonCommande> getBonsByVendeur(Long vendeurId) {
        return bonCommandeRepository.findByVendeurId(vendeurId);
    }

    public List<BonCommande> getBonsByClient(Long clientId) {
        return bonCommandeRepository.findByClientId(clientId);
    }

    public BonCommande createBon(BonCommande bon) {
        // Vérifier vendeur et client
        Vendeur vendeur = vendeurRepository.findById(bon.getVendeur().getId())
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable"));
        Client client = clientRepository.findById(bon.getClient().getId())
                .orElseThrow(() -> new RuntimeException("Client introuvable"));

        bon.setVendeur(vendeur);
        bon.setClient(client);

        BigDecimal total = BigDecimal.ZERO;

        // Pour chaque ligne : récupérer le produit réel, calculer le sous-total
        for (LigneBon ligne : bon.getLignes()) {
            Produit produit = produitRepository.findById(ligne.getProduit().getId())
                    .orElseThrow(() -> new RuntimeException(
                            "Produit introuvable avec l'id : " + ligne.getProduit().getId()));

            ligne.setProduit(produit);
            ligne.setPrixUnitaire(produit.getPrix());
            BigDecimal sousTotal = produit.getPrix().multiply(BigDecimal.valueOf(ligne.getQuantite()));
            ligne.setSousTotal(sousTotal);
            ligne.setBonCommande(bon); // lien retour obligatoire pour la relation

            total = total.add(sousTotal);
        }

        bon.setMontantTotal(total);
        bon.setStatut("EN_ATTENTE");

        return bonCommandeRepository.save(bon);
    }

    public BonCommande validerBon(Long id) {
        BonCommande bon = getBonById(id);
        bon.setStatut("VALIDE");
        return bonCommandeRepository.save(bon);
    }

    public void deleteBon(Long id) {
        BonCommande bon = getBonById(id);
        bonCommandeRepository.delete(bon);
    }
}