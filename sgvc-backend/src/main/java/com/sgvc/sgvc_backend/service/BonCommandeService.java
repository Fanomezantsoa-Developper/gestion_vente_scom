package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.*;
import com.sgvc.sgvc_backend.exception.BadRequestException;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class BonCommandeService {

    private final BonCommandeRepository bonCommandeRepository;
    private final VendeurRepository vendeurRepository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final PaiementRepository paiementRepository;

    public BonCommandeService(BonCommandeRepository bonCommandeRepository,
            VendeurRepository vendeurRepository,
            ClientRepository clientRepository,
            ProduitRepository produitRepository,
            PaiementRepository paiementRepository) {
        this.bonCommandeRepository = bonCommandeRepository;
        this.vendeurRepository = vendeurRepository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.paiementRepository = paiementRepository;
    }

    public List<BonCommande> getAllBons() {
        return bonCommandeRepository.findAll();
    }

    public BonCommande getBonById(Long id) {
        return bonCommandeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Bon introuvable avec l'id : " + id));
    }

    public List<BonCommande> getBonsByVendeur(Long vendeurId) {
        return bonCommandeRepository.findByVendeurId(vendeurId);
    }

    public List<BonCommande> getBonsByClient(Long clientId) {
        return bonCommandeRepository.findByClientId(clientId);
    }

    public List<BonCommande> getBonsByStatut(String statut) {
        return bonCommandeRepository.findByStatut(statut);
    }

    public List<BonCommande> rechercher(String q) {
        return bonCommandeRepository.rechercher(q);
    }

    @Transactional
    public BonCommande createBon(BonCommande bon) {
        if (bon.getLignes() == null || bon.getLignes().isEmpty()) {
            throw new BadRequestException("Un bon de commande doit contenir au moins une ligne");
        }

        Vendeur vendeur = vendeurRepository.findById(bon.getVendeur().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable avec l'id : " + bon.getVendeur().getId()));
        Client client = clientRepository.findById(bon.getClient().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + bon.getClient().getId()));

        bon.setVendeur(vendeur);
        bon.setClient(client);

        // Date fixée par le serveur (jamais par le client)
        bon.setDateCreation(java.time.LocalDateTime.now());

        BigDecimal total = BigDecimal.ZERO;

        // Pour chaque ligne : vérifier le stock, décrémenter, calculer le sous-total
        for (LigneBon ligne : bon.getLignes()) {
            Produit produit = produitRepository.findById(ligne.getProduit().getId())
                    .orElseThrow(() -> new ResourceNotFoundException(
                            "Produit introuvable avec l'id : " + ligne.getProduit().getId()));

            if (produit.getStock() < ligne.getQuantite()) {
                throw new BadRequestException(
                        "Stock insuffisant pour le produit '" + produit.getNom()
                                + "' (disponible : " + produit.getStock()
                                + ", demandé : " + ligne.getQuantite() + ")");
            }

            // Décrément automatique du stock
            produit.setStock(produit.getStock() - ligne.getQuantite());
            produitRepository.save(produit);

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

    @Transactional
    public BonCommande validerBon(Long id) {
        BonCommande bon = getBonById(id);

        if ("ANNULE".equals(bon.getStatut())) {
            throw new ConflictException("Impossible de valider un bon annulé");
        }
        if ("VALIDE".equals(bon.getStatut())) {
            throw new ConflictException("Ce bon est déjà validé");
        }

        bon.setStatut("VALIDE");
        return bonCommandeRepository.save(bon);
    }

    @Transactional
    public BonCommande annulerBon(Long id) {
        BonCommande bon = getBonById(id);

        if ("ANNULE".equals(bon.getStatut())) {
            throw new ConflictException("Ce bon est déjà annulé");
        }

        // On ne peut pas annuler un bon déjà payé
        if (paiementRepository.findByBonCommandeId(id).isPresent()) {
            throw new ConflictException("Ce bon a déjà été payé : annulez d'abord le paiement");
        }

        // Restitution du stock
        for (LigneBon ligne : bon.getLignes()) {
            Produit produit = ligne.getProduit();
            produit.setStock(produit.getStock() + ligne.getQuantite());
            produitRepository.save(produit);
        }

        bon.setStatut("ANNULE");
        return bonCommandeRepository.save(bon);
    }

    @Transactional
    public void deleteBon(Long id) {
        BonCommande bon = getBonById(id);

        if (paiementRepository.findByBonCommandeId(id).isPresent()) {
            throw new ConflictException("Impossible de supprimer un bon payé : annulez d'abord le paiement");
        }

        // Si le bon n'est pas annulé, restituer le stock avant suppression
        if (!"ANNULE".equals(bon.getStatut())) {
            for (LigneBon ligne : bon.getLignes()) {
                Produit produit = ligne.getProduit();
                produit.setStock(produit.getStock() + ligne.getQuantite());
                produitRepository.save(produit);
            }
        }

        bonCommandeRepository.delete(bon);
    }
}
