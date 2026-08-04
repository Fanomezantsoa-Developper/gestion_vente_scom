package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.service.RayonService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/rayons")
public class RayonController {

    private final RayonService rayonService;

    @Autowired
    public RayonController(RayonService rayonService) {
        this.rayonService = rayonService;
    }

    // GET /api/rayons → liste tous les rayons
    @GetMapping
    public ResponseEntity<List<Rayon>> getAllRayons() {
        List<Rayon> rayons = rayonService.getAllRayons();
        return ResponseEntity.ok(rayons);
    }

    // GET /api/rayons/5 → un rayon précis par son id
    @GetMapping("/{id}")
    public ResponseEntity<Rayon> getRayonById(@PathVariable Long id) {
        Rayon rayon = rayonService.getRayonById(id);
        return ResponseEntity.ok(rayon);
    }

    // POST /api/rayons → créer un nouveau rayon
    @PostMapping
    public ResponseEntity<Rayon> createRayon(@RequestBody Rayon rayon) {
        Rayon nouveauRayon = rayonService.createRayon(rayon);
        return ResponseEntity.status(HttpStatus.CREATED).body(nouveauRayon);
    }

    // PUT /api/rayons/5 → modifier un rayon existant
    @PutMapping("/{id}")
    public ResponseEntity<Rayon> updateRayon(@PathVariable Long id, @RequestBody Rayon rayon) {
        Rayon rayonModifie = rayonService.updateRayon(id, rayon);
        return ResponseEntity.ok(rayonModifie);
    }

    // DELETE /api/rayons/5 → supprimer un rayon
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRayon(@PathVariable Long id) {
        rayonService.deleteRayon(id);
        return ResponseEntity.noContent().build();
    }
}