package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Commission;
import com.sgvc.sgvc_backend.service.CommissionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;

    @Autowired
    public CommissionController(CommissionService commissionService) {
        this.commissionService = commissionService;
    }

    @GetMapping
    public ResponseEntity<List<Commission>> getAllCommissions() {
        return ResponseEntity.ok(commissionService.getAllCommissions());
    }

    @GetMapping("/vendeur/{vendeurId}")
    public ResponseEntity<List<Commission>> getCommissionsByVendeur(@PathVariable Long vendeurId) {
        return ResponseEntity.ok(commissionService.getCommissionsByVendeur(vendeurId));
    }

    // POST /api/commissions/calculer?vendeurId=1&mois=8&annee=2026
    @PostMapping("/calculer")
    public ResponseEntity<Commission> calculerCommission(
            @RequestParam Long vendeurId,
            @RequestParam Integer mois,
            @RequestParam Integer annee) {
        return ResponseEntity.ok(commissionService.calculerCommission(vendeurId, mois, annee));
    }
}