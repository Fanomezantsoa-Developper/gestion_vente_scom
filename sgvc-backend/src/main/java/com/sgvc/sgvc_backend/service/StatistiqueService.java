package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.dto.DashboardStats;
import com.sgvc.sgvc_backend.dto.RepartitionStatut;
import com.sgvc.sgvc_backend.dto.VenteParMois;
import com.sgvc.sgvc_backend.dto.VenteParRayon;
import com.sgvc.sgvc_backend.dto.VendeurStat;
import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class StatistiqueService {

    private final RayonRepository rayonRepository;
    private final VendeurRepository vendeurRepository;
    private final ClientRepository clientRepository;
    private final ProduitRepository produitRepository;
    private final BonCommandeRepository bonCommandeRepository;
    private final PaiementRepository paiementRepository;
    private final CommissionRepository commissionRepository;

    public StatistiqueService(RayonRepository rayonRepository,
            VendeurRepository vendeurRepository,
            ClientRepository clientRepository,
            ProduitRepository produitRepository,
            BonCommandeRepository bonCommandeRepository,
            PaiementRepository paiementRepository,
            CommissionRepository commissionRepository) {
        this.rayonRepository = rayonRepository;
        this.vendeurRepository = vendeurRepository;
        this.clientRepository = clientRepository;
        this.produitRepository = produitRepository;
        this.bonCommandeRepository = bonCommandeRepository;
        this.paiementRepository = paiementRepository;
        this.commissionRepository = commissionRepository;
    }

    public DashboardStats getDashboardStats() {
        List<BonCommande> bons = bonCommandeRepository.findAll();

        BigDecimal montantTotalVentes = bons.stream()
                .filter(b -> "VALIDE".equals(b.getStatut()))
                .map(BonCommande::getMontantTotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal montantTotalCommissions = commissionRepository.findAll().stream()
                .map(c -> c.getMontantCommission())
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        long bonsEnAttente = bons.stream()
                .filter(b -> "EN_ATTENTE".equals(b.getStatut()))
                .count();

        return new DashboardStats(
                rayonRepository.count(),
                vendeurRepository.count(),
                clientRepository.count(),
                produitRepository.count(),
                bons.size(),
                bonsEnAttente,
                paiementRepository.count(),
                produitRepository.findByStockLessThan(10).size(),
                montantTotalVentes,
                montantTotalCommissions);
    }

    // Ventes par mois (bons VALIDES) pour une année donnée
    public List<VenteParMois> getVentesParMois(int annee) {
        Map<Integer, BigDecimal> parMois = bonCommandeRepository.findAll().stream()
                .filter(b -> "VALIDE".equals(b.getStatut()))
                .filter(b -> b.getDateCreation().getYear() == annee)
                .collect(Collectors.groupingBy(
                        b -> b.getDateCreation().getMonthValue(),
                        Collectors.reducing(BigDecimal.ZERO, BonCommande::getMontantTotal, BigDecimal::add)));

        List<VenteParMois> resultat = new ArrayList<>();
        for (int mois = 1; mois <= 12; mois++) {
            resultat.add(new VenteParMois(mois, parMois.getOrDefault(mois, BigDecimal.ZERO)));
        }
        return resultat;
    }

    // Top vendeurs : somme des bons VALIDES, du plus performant au moins performant
    public List<VendeurStat> getMeilleursVendeurs(int limite) {
        Map<Long, List<BonCommande>> parVendeur = bonCommandeRepository.findAll().stream()
                .filter(b -> "VALIDE".equals(b.getStatut()))
                .collect(Collectors.groupingBy(b -> b.getVendeur().getId()));

        return parVendeur.entrySet().stream()
                .map(entry -> {
                    Long vendeurId = entry.getKey();
                    List<BonCommande> bons = entry.getValue();
                    BigDecimal total = bons.stream()
                            .map(BonCommande::getMontantTotal)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    String nomComplet = bons.get(0).getVendeur().getNom() + " " + bons.get(0).getVendeur().getPrenom();
                    return new VendeurStat(vendeurId, nomComplet, total, bons.size());
                })
                .sorted(Comparator.comparing(VendeurStat::getMontantVentes).reversed())
                .limit(limite)
                .toList();
    }

    // Derniers bons créés (feed du tableau de bord)
    public List<BonCommande> getDerniersBons(int limite) {
        return bonCommandeRepository.findAll().stream()
                .sorted(Comparator.comparing(BonCommande::getDateCreation).reversed())
                .limit(limite)
                .toList();
    }

    // Ventes validées par rayon (via les lignes de bon) pour une année donnée
    @Transactional(readOnly = true)
    public List<VenteParRayon> getVentesParRayon(int annee) {
        Map<Long, BigDecimal> parRayon = new HashMap<>();
        Map<Long, String> nomRayon = new HashMap<>();

        bonCommandeRepository.findAll().stream()
                .filter(b -> "VALIDE".equals(b.getStatut()))
                .filter(b -> b.getDateCreation().getYear() == annee)
                .flatMap(b -> b.getLignes().stream())
                .filter(l -> l.getProduit() != null && l.getProduit().getRayon() != null)
                .forEach(l -> {
                    Long rayonId = l.getProduit().getRayon().getId();
                    parRayon.merge(rayonId, l.getSousTotal(), BigDecimal::add);
                    nomRayon.put(rayonId, l.getProduit().getRayon().getNom());
                });

        return parRayon.entrySet().stream()
                .map(entry -> new VenteParRayon(entry.getKey(), nomRayon.get(entry.getKey()), entry.getValue()))
                .sorted(Comparator.comparing(VenteParRayon::getMontant).reversed())
                .toList();
    }

    // Répartition des bons par statut (PAYE = bon validé ayant au moins un paiement)
    public List<RepartitionStatut> getRepartitionBons() {
        List<BonCommande> bons = bonCommandeRepository.findAll();
        Map<String, Long> parStatut = bons.stream()
                .collect(Collectors.groupingBy(BonCommande::getStatut, Collectors.counting()));

        Set<Long> bonsPayes = paiementRepository.findAll().stream()
                .map(p -> p.getBonCommande().getId())
                .collect(Collectors.toSet());

        long valide = parStatut.getOrDefault("VALIDE", 0L);
        long paye = bons.stream()
                .filter(b -> "VALIDE".equals(b.getStatut()) && bonsPayes.contains(b.getId()))
                .count();

        List<RepartitionStatut> resultat = new ArrayList<>();
        resultat.add(new RepartitionStatut("EN_ATTENTE", parStatut.getOrDefault("EN_ATTENTE", 0L)));
        resultat.add(new RepartitionStatut("VALIDE", Math.max(0L, valide - paye)));
        resultat.add(new RepartitionStatut("PAYE", paye));
        resultat.add(new RepartitionStatut("ANNULE", parStatut.getOrDefault("ANNULE", 0L)));
        return resultat;
    }

    // Commissions par vendeur (montant total, toutes périodes)
    public List<VendeurStat> getCommissionsParVendeur() {
        return commissionRepository.findAll().stream()
                .collect(Collectors.groupingBy(c -> c.getVendeur().getId()))
                .entrySet().stream()
                .map(entry -> {
                    Long vendeurId = entry.getKey();
                    BigDecimal total = entry.getValue().stream()
                            .map(c -> c.getMontantCommission())
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    var commission = entry.getValue().get(0);
                    String nomComplet = commission.getVendeur().getNom() + " " + commission.getVendeur().getPrenom();
                    return new VendeurStat(vendeurId, nomComplet, total, entry.getValue().size());
                })
                .sorted(Comparator.comparing(VendeurStat::getMontantVentes).reversed())
                .toList();
    }
}
