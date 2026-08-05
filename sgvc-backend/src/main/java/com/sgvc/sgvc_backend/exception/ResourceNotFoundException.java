package com.sgvc.sgvc_backend.exception;

// Erreur métier : ressource demandée inexistante -> HTTP 404
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
