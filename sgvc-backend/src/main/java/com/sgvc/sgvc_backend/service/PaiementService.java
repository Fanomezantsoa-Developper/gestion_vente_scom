package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.entity.Paiement;
import com.sgvc.sgvc_backend.repository.BonCommandeRepository;
import com.sgvc.sgvc_backend.repository.PaiementRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaiementService {

    private final PaiementRepository paiementRepository;
    private final BonCommandeRepository bonCommandeRepository;

    @Autowired
    public PaiementService(PaiementRepository paiementRepository, BonCommandeRepository bonCommandeRepository) {
        this.paiementRepository = paiementRepository;
        this.bonCommandeRepository = bonCommandeRepository;
    }

    public List<Paiement> getAllPaiements() {
        return paiementRepository.findAll();
    }

    public Paiement getPaiementById(Long id) {
        return paiementRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Paiement introuvable avec l'id : " + id));
    }

    public Paiement createPaiement(Paiement paiement) {
        Long bonId = paiement.getBonCommande().getId();

        if (paiementRepository.findByBonCommandeId(bonId).isPresent()) {
            throw new RuntimeException("Ce bon a déjà un paiement enregistré");
        }

        BonCommande bon = bonCommandeRepository.findById(bonId)
                .orElseThrow(() -> new RuntimeException("Bon de commande introuvable"));

        paiement.setBonCommande(bon);
        paiement.setMontant(bon.getMontantTotal()); // le montant = total du bon, pas modifiable par le client
        paiement.setStatut("PAYE");

        Paiement paiementSauve = paiementRepository.save(paiement);

        // Une fois payé, on valide automatiquement le bon
        bon.setStatut("VALIDE");
        bonCommandeRepository.save(bon);

        return paiementSauve;
    }

    public void deletePaiement(Long id) {
        Paiement paiement = getPaiementById(id);
        paiementRepository.delete(paiement);
    }
}