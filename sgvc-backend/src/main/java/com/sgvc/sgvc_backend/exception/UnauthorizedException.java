package com.sgvc.sgvc_backend.exception;

// Erreur d'authentification / droits insuffisants -> HTTP 401
public class UnauthorizedException extends RuntimeException {
    public UnauthorizedException(String message) {
        super(message);
    }
}
