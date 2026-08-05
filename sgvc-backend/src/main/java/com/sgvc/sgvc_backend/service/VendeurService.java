package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.entity.Vendeur;
import com.sgvc.sgvc_backend.exception.BadRequestException;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.RayonRepository;
import com.sgvc.sgvc_backend.repository.VendeurRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class VendeurService {

    private final VendeurRepository vendeurRepository;
    private final RayonRepository rayonRepository;

    public VendeurService(VendeurRepository vendeurRepository, RayonRepository rayonRepository) {
        this.vendeurRepository = vendeurRepository;
        this.rayonRepository = rayonRepository;
    }

    public List<Vendeur> getAllVendeurs() {
        return vendeurRepository.findAll();
    }

    public Vendeur getVendeurById(Long id) {
        return vendeurRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendeur introuvable avec l'id : " + id));
    }

    public List<Vendeur> getVendeursByRayon(Long rayonId) {
        return vendeurRepository.findByRayonId(rayonId);
    }

    public List<Vendeur> rechercher(String q) {
        return vendeurRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q);
    }

    @Transactional
    public Vendeur createVendeur(Vendeur vendeur) {
        if (vendeur.getEmail() != null && vendeurRepository.existsByEmail(vendeur.getEmail())) {
            throw new ConflictException("Un vendeur avec cet email existe déjà : " + vendeur.getEmail());
        }

        if (vendeur.getRayon() == null || vendeur.getRayon().getId() == null) {
            throw new BadRequestException("Le rayon du vendeur est obligatoire");
        }

        Long rayonId = vendeur.getRayon().getId();
        Rayon rayon = rayonRepository.findById(rayonId)
                .orElseThrow(() -> new ResourceNotFoundException("Rayon introuvable avec l'id : " + rayonId));

        vendeur.setRayon(rayon);
        return vendeurRepository.save(vendeur);
    }

    @Transactional
    public Vendeur updateVendeur(Long id, Vendeur vendeurDetails) {
        Vendeur vendeur = getVendeurById(id);

        vendeurRepository.findByEmail(vendeurDetails.getEmail())
                .filter(autre -> !autre.getId().equals(id))
                .ifPresent(autre -> {
                    throw new ConflictException("Un vendeur avec cet email existe déjà : " + vendeurDetails.getEmail());
                });

        vendeur.setNom(vendeurDetails.getNom());
        vendeur.setPrenom(vendeurDetails.getPrenom());
        vendeur.setEmail(vendeurDetails.getEmail());
        vendeur.setTelephone(vendeurDetails.getTelephone());

        // Si le rayon change, vérifier que le nouveau existe
        if (vendeurDetails.getRayon() != null && vendeurDetails.getRayon().getId() != null) {
            Long rayonId = vendeurDetails.getRayon().getId();
            Rayon rayon = rayonRepository.findById(rayonId)
                    .orElseThrow(() -> new ResourceNotFoundException("Rayon introuvable avec l'id : " + rayonId));
            vendeur.setRayon(rayon);
        }

        return vendeurRepository.save(vendeur);
    }

    public void deleteVendeur(Long id) {
        Vendeur vendeur = getVendeurById(id);
        vendeurRepository.delete(vendeur);
    }
}
