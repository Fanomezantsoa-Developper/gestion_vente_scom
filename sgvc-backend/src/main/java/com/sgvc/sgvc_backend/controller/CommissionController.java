package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Commission;
import com.sgvc.sgvc_backend.service.CommissionService;
import com.sgvc.sgvc_backend.service.export.CsvExportService;
import com.sgvc.sgvc_backend.service.export.PdfExportService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/commissions")
public class CommissionController {

    private final CommissionService commissionService;
    private final PdfExportService pdfExportService;
    private final CsvExportService csvExportService;

    public CommissionController(CommissionService commissionService,
            PdfExportService pdfExportService,
            CsvExportService csvExportService) {
        this.commissionService = commissionService;
        this.pdfExportService = pdfExportService;
        this.csvExportService = csvExportService;
    }

    @GetMapping
    public ResponseEntity<List<Commission>> getAllCommissions() {
        return ResponseEntity.ok(commissionService.getAllCommissions());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Commission> getCommissionById(@PathVariable Long id) {
        return ResponseEntity.ok(commissionService.getCommissionById(id));
    }

    @GetMapping("/vendeur/{vendeurId}")
    public ResponseEntity<List<Commission>> getCommissionsByVendeur(@PathVariable Long vendeurId) {
        return ResponseEntity.ok(commissionService.getCommissionsByVendeur(vendeurId));
    }

    // GET /api/commissions/export-csv → export Excel de toutes les commissions
    @GetMapping("/export-csv")
    public ResponseEntity<byte[]> exportCsv() {
        byte[] csv = csvExportService.exporterCommissions(commissionService.getAllCommissions());
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType("text/csv"))
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=commissions.csv")
                .body(csv);
    }

    // GET /api/commissions/{id}/export-pdf → bulletin de commission PDF
    @GetMapping("/{id}/export-pdf")
    public ResponseEntity<byte[]> exportPdf(@PathVariable Long id) {
        byte[] pdf = pdfExportService.genererPdfCommission(commissionService.getCommissionById(id));
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=commission-" + id + ".pdf")
                .body(pdf);
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
