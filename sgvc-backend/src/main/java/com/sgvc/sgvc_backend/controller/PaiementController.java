package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Paiement;
import com.sgvc.sgvc_backend.service.PaiementService;
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
@RequestMapping("/api/paiements")
public class PaiementController {

    private final PaiementService paiementService;
    private final PdfExportService pdfExportService;
    private final CsvExportService csvExportService;

    public PaiementController(PaiementService paiementService,
            PdfExportService pdfExportService,
            CsvExportService csvExportService) {
        this.paiementService = paiementService;
        this.pdfExportService = pdfExportService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<List<Paiement>> getAllPaiements() {
        return ResponseEntity.ok(paiementService.getAllPaiements());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Paiement> getPaiementById(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.getPaiementById(id));
    }

    // GET /api/paiements/export-csv → export Excel de tous les paiements
    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = csvExportService.exporterPaiements(paiementService.getAllPaiements());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=paiements.csv")
                .body(csv);
    }

    // GET /api/paiements/{id}/export-pdf → reçu de paiement PDF
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = pdfExportService.genererPdfRecu(paiementService.getPaiementById(id));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=recu-paiement-" + id + ".pdf")
                .body(pdf);
    }

    @PostMapping
    public ResponseEntity<Paiement> createPaiement(@Valid @RequestBody Paiement paiement) {
        return ResponseEntity.status(HttpStatus.CREATED).body(paiementService.createPaiement(paiement));
    }

    @PutMapping("/{id}/annuler")
    public ResponseEntity<Paiement> annulerPaiement(@PathVariable Long id) {
        return ResponseEntity.ok(paiementService.annulerPaiement(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePaiement(@PathVariable Long id) {
        paiementService.deletePaiement(id);
        return ResponseEntity.noContent().build();
    }
}
