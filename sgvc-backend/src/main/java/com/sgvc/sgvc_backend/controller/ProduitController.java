package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Produit;
import com.sgvc.sgvc_backend.service.ProduitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;

    @Autowired
    public ProduitController(ProduitService produitService) {
        this.produitService = produitService;
    }

    @GetMapping
    public ResponseEntity<List<Produit>> getAllProduits() {
        return ResponseEntity.ok(produitService.getAllProduits());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Produit> getProduitById(@PathVariable Long id) {
        return ResponseEntity.ok(produitService.getProduitById(id));
    }

    @GetMapping("/rayon/{rayonId}")
    public ResponseEntity<List<Produit>> getProduitsByRayon(@PathVariable Long rayonId) {
        return ResponseEntity.ok(produitService.getProduitsByRayon(rayonId));
    }

    // GET /api/produits/stock-faible?seuil=10
    @GetMapping("/stock-faible")
    public ResponseEntity<List<Produit>> getProduitsStockFaible(@RequestParam(defaultValue = "10") Integer seuil) {
        return ResponseEntity.ok(produitService.getProduitsStockFaible(seuil));
    }

    @PostMapping
    public ResponseEntity<Produit> createProduit(@RequestBody Produit produit) {
        Produit nouveauProduit = produitService.createProduit(produit);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauProduit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @RequestBody Produit produit) {
        return ResponseEntity.ok(produitService.updateProduit(id, produit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}