package com.sgvc.sgvc_backend.controller;

import com.sgvc.sgvc_backend.dto.LoginRequest;
import com.sgvc.sgvc_backend.dto.LoginResponse;
import com.sgvc.sgvc_backend.entity.Utilisateur;
import com.sgvc.sgvc_backend.exception.UnauthorizedException;
import com.sgvc.sgvc_backend.repository.UtilisateurRepository;
import com.sgvc.sgvc_backend.security.JwtUtil;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UtilisateurRepository utilisateurRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public AuthController(UtilisateurRepository utilisateurRepository,
            PasswordEncoder passwordEncoder,
            JwtUtil jwtUtil) {
        this.utilisateurRepository = utilisateurRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@Valid @RequestBody LoginRequest loginRequest) {
        Utilisateur utilisateur = utilisateurRepository.findByEmail(loginRequest.getEmail())
                .orElseThrow(() -> new UnauthorizedException("Email ou mot de passe incorrect"));

        if (!passwordEncoder.matches(loginRequest.getMotDePasse(), utilisateur.getMotDePasse())) {
            throw new UnauthorizedException("Email ou mot de passe incorrect");
        }

        if (!utilisateur.isActif()) {
            throw new UnauthorizedException("Ce compte est désactivé");
        }

        List<String> roles = utilisateur.getRoles().stream()
                .map(role -> role.getNom())
                .toList();

        String token = jwtUtil.generateToken(utilisateur.getEmail(), roles);

        return ResponseEntity.ok(new LoginResponse(token, utilisateur.getEmail(), utilisateur.getNom(), roles));
    }
}
