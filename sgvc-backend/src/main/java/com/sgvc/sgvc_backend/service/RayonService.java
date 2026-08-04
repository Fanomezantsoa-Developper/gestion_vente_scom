package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.repository.RayonRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class RayonService {

    private final RayonRepository rayonRepository;

    @Autowired
    public RayonService(RayonRepository rayonRepository) {
        this.rayonRepository = rayonRepository;
    }

    // Récupérer tous les rayons
    public List<Rayon> getAllRayons() {
        return rayonRepository.findAll();
    }

    // Récupérer un rayon par son id
    public Rayon getRayonById(Long id) {
        return rayonRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rayon introuvable avec l'id : " + id));
    }

    // Créer un nouveau rayon
    public Rayon createRayon(Rayon rayon) {
        if (rayonRepository.existsByNom(rayon.getNom())) {
            throw new RuntimeException("Un rayon avec ce nom existe déjà : " + rayon.getNom());
        }
        return rayonRepository.save(rayon);
    }

    // Mettre à jour un rayon existant
    public Rayon updateRayon(Long id, Rayon rayonDetails) {
        Rayon rayon = getRayonById(id);
        rayon.setNom(rayonDetails.getNom());
        rayon.setDescription(rayonDetails.getDescription());
        return rayonRepository.save(rayon);
    }

    // Supprimer un rayon
    public void deleteRayon(Long id) {
        Rayon rayon = getRayonById(id);
        rayonRepository.delete(rayon);
    }
}