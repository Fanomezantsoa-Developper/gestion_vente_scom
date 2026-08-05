package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.service.BonCommandeService;
import com.sgvc.sgvc_backend.service.export.CsvExportService;
import com.sgvc.sgvc_backend.service.export.PdfExportService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bons-commande")
public class BonCommandeController {

    private final BonCommandeService bonCommandeService;
    private final PdfExportService pdfExportService;
    private final CsvExportService csvExportService;

    public BonCommandeController(BonCommandeService bonCommandeService,
            PdfExportService pdfExportService,
            CsvExportService csvExportService) {
        this.bonCommandeService = bonCommandeService;
        this.pdfExportService = pdfExportService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<List<BonCommande>> getAllBons() {
        return ResponseEntity.ok(bonCommandeService.getAllBons());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BonCommande> getBonById(@PathVariable Long id) {
        return ResponseEntity.ok(bonCommandeService.getBonById(id));
    }

    // GET /api/bons-commande/vendeur/{vendeurId} → bons d'un vendeur
    @GetMapping("/vendeur/{vendeurId}")
    public ResponseEntity<List<BonCommande>> getBonsByVendeur(@PathVariable Long vendeurId) {
        return ResponseEntity.ok(bonCommandeService.getBonsByVendeur(vendeurId));
    }

    // GET /api/bons-commande/statut/VALIDE → filtre par statut
    @GetMapping("/statut/{statut}")
    public ResponseEntity<List<BonCommande>> getBonsByStatut(@PathVariable String statut) {
        return ResponseEntity.ok(bonCommandeService.getBonsByStatut(statut));
    }

    // GET /api/bons-commande/recherche?q=jean → recherche par vendeur ou client
    @GetMapping("/recherche")
    public ResponseEntity<List<BonCommande>> rechercher(@RequestParam String q) {
        return ResponseEntity.ok(bonCommandeService.rechercher(q));
    }

    // GET /api/bons-commande/export-csv → export Excel de tous les bons
    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = csvExportService.exporterBons(bonCommandeService.getAllBons());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bons-commande.csv")
                .body(csv);
    }

    // GET /api/bons-commande/{id}/export-pdf → facture PDF d'un bon
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = pdfExportService.genererPdfBon(bonCommandeService.getBonById(id));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=bon-" + id + ".pdf")
                .body(pdf);
    }

    @PostMapping
    public ResponseEntity<BonCommande> createBon(@Valid @RequestBody BonCommande bon) {
        return ResponseEntity.status(HttpStatus.CREATED).body(bonCommandeService.createBon(bon));
    }

    @PutMapping("/{id}/valider")
    public ResponseEntity<BonCommande> validerBon(@PathVariable Long id) {
        return ResponseEntity.ok(bonCommandeService.validerBon(id));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<BonCommande> annulerBon(@PathVariable Long id) {
        return ResponseEntity.ok(bonCommandeService.annulerBon(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBon(@PathVariable Long id) {
        bonCommandeService.deleteBon(id);
        return ResponseEntity.noContent().build();
    }
}
