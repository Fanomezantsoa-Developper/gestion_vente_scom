package com.sgvc.sgvc_backend.exception;

// Erreur métier : requête invalide (données incorrectes) -> HTTP 400
public class BadRequestException extends RuntimeException {
    public BadRequestException(String message) {
        super(message);
    }
}
