package com.sgvc.sgvc_backend.exception;

// Erreur métier : conflit avec l'état actuel (doublon, règle métier violée) -> HTTP 409
public class ConflictException extends RuntimeException {
    public ConflictException(String message) {
        super(message);
    }
}
