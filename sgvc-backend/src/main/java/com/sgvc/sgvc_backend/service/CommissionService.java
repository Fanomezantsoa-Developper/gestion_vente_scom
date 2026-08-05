package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.*;
import com.sgvc.sgvc_backend.exception.BadRequestException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.YearMonth;
import java.util.List;

@Service
public class CommissionService {

    private static final BigDecimal COMMISSION_MINIMUM = BigDecimal.valueOf(200000);
    private static final BigDecimal TAUX_COMMISSION = BigDecimal.valueOf(5);

    private final CommissionRepository commissionRepository;
    private final VendeurRepository vendeurRepository;
    private final BonCommandeRepository bonCommandeRepository;

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

    public Commission getCommissionById(Long id) {
        return commissionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Commission introuvable avec l'id : " + id));
    }

    // Calcul (ou recalcul) de la commission d'un vendeur pour un mois donné.
    // Unicité garantie : s'il existe déjà une commission pour (vendeur, mois, année),
    // elle est recalculée et mise à jour au lieu d'être dupliquée.
    @Transactional
    public Commission calculerCommission(Long vendeurId, Integer mois, Integer annee) {
        validerMois(mois, annee);

        Vendeur vendeur = vendeurRepository.findById(vendeurId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable avec l'id : " + vendeurId));

        // Récupérer tous les bons VALIDÉS de ce vendeur pour le mois demandé
        BigDecimal totalVentes = bonCommandeRepository.findByVendeurId(vendeurId).stream()
                .filter(bon -> "VALIDE".equals(bon.getStatut()))
                .filter(bon -> bon.getDateCreation().getMonthValue() == mois)
                .filter(bon -> bon.getDateCreation().getYear() == annee)
                .map(BonCommande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal commissionCalculee = totalVentes
                .multiply(TAUX_COMMISSION)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);

        // Règle métier clé : minimum garanti de 200 000 Ar
        BigDecimal commissionFinale = commissionCalculee.max(COMMISSION_MINIMUM);

        // Existe déjà ? => on met à jour. Sinon => on crée.
        Commission commission = commissionRepository
                .findByVendeurIdAndMoisAndAnnee(vendeurId, mois, annee)
                .orElseGet(Commission::new);

        commission.setVendeur(vendeur);
        commission.setMois(mois);
        commission.setAnnee(annee);
        commission.setMontantVentes(totalVentes);
        commission.setTauxCommission(TAUX_COMMISSION);
        commission.setMontantCommission(commissionFinale);

        return commissionRepository.save(commission);
    }

    private void validerMois(Integer mois, Integer annee) {
        if (mois == null || mois < 1 || mois > 12) {
            throw new BadRequestException("Le mois doit être compris entre 1 et 12");
        }
        if (annee == null || annee < 2000 || annee > YearMonth.now().getYear() + 1) {
            throw new BadRequestException("L'année est invalide");
        }
    }
}
