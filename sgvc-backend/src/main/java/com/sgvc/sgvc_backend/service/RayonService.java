package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.RayonRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class RayonService {

    private final RayonRepository rayonRepository;

    public RayonService(RayonRepository rayonRepository) {
        this.rayonRepository = rayonRepository;
    }

    public List<Rayon> getAllRayons() {
        return rayonRepository.findAll();
    }

    public Rayon getRayonById(Long id) {
        return rayonRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Rayon introuvable avec l'id : " + id));
    }

    public List<Rayon> rechercher(String q) {
        return rayonRepository.findByNomContainingIgnoreCase(q);
    }

    public Rayon createRayon(Rayon rayon) {
        if (rayonRepository.existsByNom(rayon.getNom())) {
            throw new ConflictException("Un rayon avec ce nom existe déjà : " + rayon.getNom());
        }
        return rayonRepository.save(rayon);
    }

    @Transactional
    public Rayon updateRayon(Long id, Rayon rayonDetails) {
        Rayon rayon = getRayonById(id);
        rayon.setNom(rayonDetails.getNom());
        rayon.setDescription(rayonDetails.getDescription());
        return rayonRepository.save(rayon);
    }

    public void deleteRayon(Long id) {
        Rayon rayon = getRayonById(id);
        rayonRepository.delete(rayon);
    }
}
