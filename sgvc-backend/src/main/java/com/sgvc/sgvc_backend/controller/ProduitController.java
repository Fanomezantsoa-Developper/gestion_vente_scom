package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Produit;
import com.sgvc.sgvc_backend.service.ProduitService;
import com.sgvc.sgvc_backend.service.export.CsvExportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/produits")
public class ProduitController {

    private final ProduitService produitService;
    private final CsvExportService csvExportService;

    public ProduitController(ProduitService produitService, CsvExportService csvExportService) {
        this.produitService = produitService;
        this.csvExportService = csvExportService;
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

    // GET /api/produits/recherche?q=cafe → recherche par nom ou référence
    @GetMapping("/recherche")
    public ResponseEntity<List<Produit>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(produitService.rechercher(q));
    }

    // GET /api/produits/export-csv → export Excel du catalogue
    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = csvExportService.exporterProduits(produitService.getAllProduits());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=produits.csv")
                .body(csv);
    }

    @PostMapping
    public ResponseEntity<Produit> createProduit(@Valid @RequestBody Produit produit) {
        Produit nouveauProduit = produitService.createProduit(produit);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauProduit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Produit> updateProduit(@PathVariable Long id, @Valid @RequestBody Produit produit) {
        return ResponseEntity.ok(produitService.updateProduit(id, produit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteProduit(@PathVariable Long id) {
        produitService.deleteProduit(id);
        return ResponseEntity.noContent().build();
    }
}
