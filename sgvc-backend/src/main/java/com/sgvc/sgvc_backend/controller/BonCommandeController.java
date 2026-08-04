package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.service.BonCommandeService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bons-commande")
public class BonCommandeController {

    private final BonCommandeService bonCommandeService;

    @Autowired
    public BonCommandeController(BonCommandeService bonCommandeService) {
        this.bonCommandeService = bonCommandeService;
    }

    @GetMapping
    public ResponseEntity<List<BonCommande>> getAllBons() {
        return ResponseEntity.ok(bonCommandeService.getAllBons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BonCommande> getBonById(@PathVariable Long id) {
        return ResponseEntity.ok(bonCommandeService.getBonById(id));
    }

    @GetMapping("/vendeur/{vendeurId}")
    public ResponseEntity<List<BonCommande>> getBonsByVendeur(@PathVariable Long vendeurId) {
        return ResponseEntity.ok(bonCommandeService.getBonsByVendeur(vendeurId));
    }

    @PostMapping
    public ResponseEntity<BonCommande> createBon(@RequestBody BonCommande bon) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bonCommandeService.createBon(bon));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<BonCommande> validerBon(@PathVariable Long id) {
        return ResponseEntity.ok(bonCommandeService.validerBon(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBon(@PathVariable Long id) {
        bonCommandeService.deleteBon(id);
        return ResponseEntity.noContent().build();
    }
}