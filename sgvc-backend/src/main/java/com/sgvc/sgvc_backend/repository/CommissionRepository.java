package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Commission;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CommissionRepository extends JpaRepository<Commission, Long> {
    List<Commission> findByVendeurId(Long vendeurId);

    List<Commission> findByMoisAndAnnee(Integer mois, Integer annee);
}