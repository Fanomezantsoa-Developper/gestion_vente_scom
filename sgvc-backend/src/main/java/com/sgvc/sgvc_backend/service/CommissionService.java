package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.*;
import com.sgvc.sgvc_backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CommissionService {

    private static final BigDecimal COMMISSION_MINIMUM = BigDecimal.valueOf(200000);

    private final CommissionRepository commissionRepository;
    private final VendeurRepository vendeurRepository;
    private final BonCommandeRepository bonCommandeRepository;

    @Autowired
    public CommissionService(CommissionRepository commissionRepository,
            VendeurRepository vendeurRepository,
            BonCommandeRepository bonCommandeRepository) {
        this.commissionRepository = commissionRepository;
        this.vendeurRepository = vendeurRepository;
        this.bonCommandeRepository = bonCommandeRepository;
    }

    public List<Commission> getAllCommissions() {
        return commissionRepository.findAll();
    }

    public List<Commission> getCommissionsByVendeur(Long vendeurId) {
        return commissionRepository.findByVendeurId(vendeurId);
    }

    // Calcul automatique de la commission d'un vendeur pour un mois donné
    public Commission calculerCommission(Long vendeurId, Integer mois, Integer annee) {
        Vendeur vendeur = vendeurRepository.findById(vendeurId)
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable"));

        // Récupérer tous les bons VALIDÉS de ce vendeur
        List<BonCommande> bons = bonCommandeRepository.findByVendeurId(vendeurId);

        BigDecimal totalVentes = BigDecimal.ZERO;
        for (BonCommande bon : bons) {
            boolean memeMois = bon.getDateCreation().getMonthValue() == mois;
            boolean memeAnnee = bon.getDateCreation().getYear() == annee;
            boolean estValide = bon.getStatut().equals("VALIDE");

            if (memeMois && memeAnnee && estValide) {
                totalVentes = totalVentes.add(bon.getMontantTotal());
            }
        }

        BigDecimal taux = BigDecimal.valueOf(5); // 5% par défaut, pourrait être configurable par vendeur plus tard
        BigDecimal commissionCalculee = totalVentes
                .multiply(taux)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // ⚡ Règle métier clé : minimum garanti de 200 000 Ar
        BigDecimal commissionFinale = commissionCalculee.max(COMMISSION_MINIMUM);

        Commission commission = new Commission();
        commission.setVendeur(vendeur);
        commission.setMois(mois);
        commission.setAnnee(annee);
        commission.setMontantVentes(totalVentes);
        commission.setTauxCommission(taux);
        commission.setMontantCommission(commissionFinale);

        return commissionRepository.save(commission);
    }
}