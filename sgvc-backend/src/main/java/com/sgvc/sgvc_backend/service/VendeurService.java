package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Rayon;
import com.sgvc.sgvc_backend.entity.Vendeur;
import com.sgvc.sgvc_backend.repository.RayonRepository;
import com.sgvc.sgvc_backend.repository.VendeurRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class VendeurService {

    private final VendeurRepository vendeurRepository;
    private final RayonRepository rayonRepository;

    @Autowired
    public VendeurService(VendeurRepository vendeurRepository, RayonRepository rayonRepository) {
        this.vendeurRepository = vendeurRepository;
        this.rayonRepository = rayonRepository;
    }

    public List<Vendeur> getAllVendeurs() {
        return vendeurRepository.findAll();
    }

    public Vendeur getVendeurById(Long id) {
        return vendeurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Vendeur introuvable avec l'id : " + id));
    }

    public List<Vendeur> getVendeursByRayon(Long rayonId) {
        return vendeurRepository.findByRayonId(rayonId);
    }

    public Vendeur createVendeur(Vendeur vendeur) {
        // Vérifier que l'email n'est pas déjà utilisé
        if (vendeur.getEmail() != null && vendeurRepository.existsByEmail(vendeur.getEmail())) {
            throw new RuntimeException("Un vendeur avec cet email existe déjà : " + vendeur.getEmail());
        }

        // Vérifier que le rayon associé existe bien
        Long rayonId = vendeur.getRayon().getId();
        Rayon rayon = rayonRepository.findById(rayonId)
                .orElseThrow(() -> new RuntimeException("Rayon introuvable avec l'id : " + rayonId));

        vendeur.setRayon(rayon);
        return vendeurRepository.save(vendeur);
    }

    public Vendeur updateVendeur(Long id, Vendeur vendeurDetails) {
        Vendeur vendeur = getVendeurById(id);
        vendeur.setNom(vendeurDetails.getNom());
        vendeur.setPrenom(vendeurDetails.getPrenom());
        vendeur.setEmail(vendeurDetails.getEmail());
        vendeur.setTelephone(vendeurDetails.getTelephone());

        // Si le rayon change, vérifier que le nouveau existe
        if (vendeurDetails.getRayon() != null) {
            Long rayonId = vendeurDetails.getRayon().getId();
            Rayon rayon = rayonRepository.findById(rayonId)
                    .orElseThrow(() -> new RuntimeException("Rayon introuvable avec l'id : " + rayonId));
            vendeur.setRayon(rayon);
        }

        return vendeurRepository.save(vendeur);
    }

    public void deleteVendeur(Long id) {
        Vendeur vendeur = getVendeurById(id);
        vendeurRepository.delete(vendeur);
    }
}