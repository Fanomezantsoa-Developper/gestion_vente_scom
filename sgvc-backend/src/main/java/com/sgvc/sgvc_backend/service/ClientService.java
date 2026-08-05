package com.sgvc.sgvc_backend.service;

import com.sgvc.sgvc_backend.entity.Client;
import com.sgvc.sgvc_backend.exception.ConflictException;
import com.sgvc.sgvc_backend.exception.ResourceNotFoundException;
import com.sgvc.sgvc_backend.repository.ClientRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ClientService {

    private final ClientRepository clientRepository;

    public ClientService(ClientRepository clientRepository) {
        this.clientRepository = clientRepository;
    }

    public List<Client> getAllClients() {
        return clientRepository.findAll();
    }

    public Client getClientById(Long id) {
        return clientRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Client introuvable avec l'id : " + id));
    }

    public List<Client> rechercher(String q) {
        return clientRepository.findByNomContainingIgnoreCaseOrPrenomContainingIgnoreCase(q, q);
    }

    public Client createClient(Client client) {
        if (client.getEmail() != null && clientRepository.existsByEmail(client.getEmail())) {
            throw new ConflictException("Un client avec cet email existe déjà : " + client.getEmail());
        }
        return clientRepository.save(client);
    }

    @Transactional
    public Client updateClient(Long id, Client clientDetails) {
        Client client = getClientById(id);

        clientRepository.findByEmail(clientDetails.getEmail())
                .filter(autre -> !autre.getId().equals(id))
                .ifPresent(autre -> {
                    throw new ConflictException("Un client avec cet email existe déjà : " + clientDetails.getEmail());
                });

        client.setNom(clientDetails.getNom());
        client.setPrenom(clientDetails.getPrenom());
        client.setEmail(clientDetails.getEmail());
        client.setTelephone(clientDetails.getTelephone());
        client.setAdresse(clientDetails.getAdresse());
        return clientRepository.save(client);
    }

    public void deleteClient(Long id) {
        Client client = getClientById(id);
        clientRepository.delete(client);
    }
}
