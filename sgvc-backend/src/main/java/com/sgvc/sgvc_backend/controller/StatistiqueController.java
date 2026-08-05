package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.dto.DashboardStats;
import com.sgvc.sgvc_backend.dto.RepartitionStatut;
import com.sgvc.sgvc_backend.dto.VenteParMois;
import com.sgvc.sgvc_backend.dto.VenteParRayon;
import com.sgvc.sgvc_backend.dto.VendeurStat;
import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.service.StatistiqueService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Year;
import java.util.List;

@RestController
@RequestMapping("/api/statistiques")
public class StatistiqueController {

    private final StatistiqueService statistiqueService;

    public StatistiqueController(StatistiqueService statistiqueService) {
        this.statistiqueService = statistiqueService;
    }

    // GET /api/statistiques/dashboard → tous les indicateurs du tableau de bord
    @GetMapping("/dashboard")
    public ResponseEntity<DashboardStats> getDashboard() {
        return ResponseEntity.ok(statistiqueService.getDashboardStats());
    }

    // GET /api/statistiques/ventes-par-mois?annee=2026 → graphique annuel
    @GetMapping("/ventes-par-mois")
    public ResponseEntity<List<VenteParMois>> getVentesParMois(
            @RequestParam(required = false) Integer annee) {
        int anneeEffective = (annee != null) ? annee : Year.now().getValue();
        return ResponseEntity.ok(statistiqueService.getVentesParMois(anneeEffective));
    }

    // GET /api/statistiques/meilleurs-vendeurs?limite=5 → top vendeurs
    @GetMapping("/meilleurs-vendeurs")
    public ResponseEntity<List<VendeurStat>> getMeilleursVendeurs(
            @RequestParam(defaultValue = "5") int limite) {
        return ResponseEntity.ok(statistiqueService.getMeilleursVendeurs(limite));
    }

    // GET /api/statistiques/derniers-bons?limite=5 → dernières ventes
    @GetMapping("/derniers-bons")
    public ResponseEntity<List<BonCommande>> getDerniersBons(
            @RequestParam(defaultValue = "5") int limite) {
        return ResponseEntity.ok(statistiqueService.getDerniersBons(limite));
    }

    // GET /api/statistiques/ventes-par-rayon?annee=2026 → donut des ventes par rayon
    @GetMapping("/ventes-par-rayon")
    public ResponseEntity<List<VenteParRayon>> getVentesParRayon(
            @RequestParam(required = false) Integer annee) {
        int anneeEffective = (annee != null) ? annee : Year.now().getValue();
        return ResponseEntity.ok(statistiqueService.getVentesParRayon(anneeEffective));
    }

    // GET /api/statistiques/repartition-bons → donut des bons par statut
    @GetMapping("/repartition-bons")
    public ResponseEntity<List<RepartitionStatut>> getRepartitionBons() {
        return ResponseEntity.ok(statistiqueService.getRepartitionBons());
    }

    // GET /api/statistiques/commissions-par-vendeur → donut des commissions par vendeur
    @GetMapping("/commissions-par-vendeur")
    public ResponseEntity<List<VendeurStat>> getCommissionsParVendeur() {
        return ResponseEntity.ok(statistiqueService.getCommissionsParVendeur());
    }
}
