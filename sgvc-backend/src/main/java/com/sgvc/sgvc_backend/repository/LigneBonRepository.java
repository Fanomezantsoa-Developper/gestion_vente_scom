package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.LigneBon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface LigneBonRepository extends JpaRepository<LigneBon, Long> {
}