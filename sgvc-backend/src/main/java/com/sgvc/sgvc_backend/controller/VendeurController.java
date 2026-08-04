package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Vendeur;
import com.sgvc.sgvc_backend.service.VendeurService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendeurs")
public class VendeurController {

    private final VendeurService vendeurService;

    @Autowired
    public VendeurController(VendeurService vendeurService) {
        this.vendeurService = vendeurService;
    }

    // GET /api/vendeurs → liste tous les vendeurs
    @GetMapping
    public ResponseEntity<List<Vendeur>> getAllVendeurs() {
        return ResponseEntity.ok(vendeurService.getAllVendeurs());
    }

    // GET /api/vendeurs/3 → un vendeur précis
    @GetMapping("/{id}")
    public ResponseEntity<Vendeur> getVendeurById(@PathVariable Long id) {
        return ResponseEntity.ok(vendeurService.getVendeurById(id));
    }

    // GET /api/vendeurs/rayon/1 → tous les vendeurs d'un rayon donné
    @GetMapping("/rayon/{rayonId}")
    public ResponseEntity<List<Vendeur>> getVendeursByRayon(@PathVariable Long rayonId) {
        return ResponseEntity.ok(vendeurService.getVendeursByRayon(rayonId));
    }

    // POST /api/vendeurs → créer un nouveau vendeur
    @PostMapping
    public ResponseEntity<Vendeur> createVendeur(@RequestBody Vendeur vendeur) {
        Vendeur nouveauVendeur = vendeurService.createVendeur(vendeur);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauVendeur);
    }

    // PUT /api/vendeurs/3 → modifier un vendeur
    @PutMapping("/{id}")
    public ResponseEntity<Vendeur> updateVendeur(@PathVariable Long id, @RequestBody Vendeur vendeur) {
        return ResponseEntity.ok(vendeurService.updateVendeur(id, vendeur));
    }

    // DELETE /api/vendeurs/3 → supprimer un vendeur
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendeur(@PathVariable Long id) {
        vendeurService.deleteVendeur(id);
        return ResponseEntity.noContent().build();
    }
}
