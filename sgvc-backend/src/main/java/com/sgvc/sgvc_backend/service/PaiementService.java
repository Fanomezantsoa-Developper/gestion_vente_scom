package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.entity.Paiement;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.BonCommandeRepository;
import com.sgvc.sgvc_backend.repository.PaiementRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final BonCommandeRepository bonCommandeRepository;

    public PaiementService(PaiementRepository paiementRepository, BonCommandeRepository bonCommandeRepository) {
        this.paiementRepository = paiementRepository;
        this.bonCommandeRepository = bonCommandeRepository;
    }

    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    public Paiement getPaiementById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Paiement introuvable avec l'id : " + id));
    }

    @Transactional
    public Paiement createPaiement(Paiement paiement) {
        Long bonId = paiement.getBonCommande().getId();

        if (paiementRepository.findByBonCommandeId(bonId).isPresent()) {
            throw new ConflictException("Ce bon a déjà un paiement enregistré");
        }

        BonCommande bon = bonCommandeRepository.findById(bonId)
                .orElseThrow(() -> new ResourceNotFoundException("Bon de commande introuvable avec l'id : " + bonId));

        if ("ANNULE".equals(bon.getStatut())) {
            throw new ConflictException("Impossible de payer un bon annulé");
        }

        paiement.setBonCommande(bon);
        paiement.setDatePaiement(java.time.LocalDateTime.now()); // date fixée par le serveur
        paiement.setMontant(bon.getMontantTotal()); // montant = total du bon, non modifiable par le client
        paiement.setStatut("PAYE");

        Paiement paiementSauve = paiementRepository.save(paiement);

        // Une fois payé, on valide automatiquement le bon
        bon.setStatut("VALIDE");
        bonCommandeRepository.save(bon);

        return paiementSauve;
    }

    @Transactional
    public Paiement annulerPaiement(Long id) {
        Paiement paiement = getPaiementById(id);

        if ("ANNULE".equals(paiement.getStatut())) {
            throw new ConflictException("Ce paiement est déjà annulé");
        }

        paiement.setStatut("ANNULE");

        // Le bon revient à l'état EN_ATTENTE (le stock n'est PAS restitué,
        // car la marchandise est toujours commandée)
        BonCommande bon = paiement.getBonCommande();
        bon.setStatut("EN_ATTENTE");
        bonCommandeRepository.save(bon);

        return paiementRepository.save(paiement);
    }

    public void deletePaiement(Long id) {
        Paiement paiement = getPaiementById(id);
        paiementRepository.delete(paiement);
    }
}
