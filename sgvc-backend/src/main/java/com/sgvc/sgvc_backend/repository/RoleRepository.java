package com.sgvc.sgvc_backend.repository;

import com.sgvc.sgvc_backend.entity.Role;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByNom(String nom);

    boolean existsByNom(String nom);
}