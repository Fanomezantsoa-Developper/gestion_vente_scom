package com.sgvc.sgvc_backend.service.export;

import com.opencsv.CSVWriter;
import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.entity.Commission;
import com.sgvc.sgvc_backend.entity.LigneBon;
import com.sgvc.sgvc_backend.entity.Paiement;
import com.sgvc.sgvc_backend.entity.Produit;
import org.springframework.stereotype.Service;

import java.io.StringWriter;
import java.math.BigDecimal;
import java.util.List;

// Export des listes au format CSV (ouvrable dans Excel)
@Service
public class CsvExportService {

    public byte[] exporterBons(List<BonCommande> bons) {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw, ';', CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, System.lineSeparator());
        writer.writeNext(new String[] { "ID", "Date", "Client", "Vendeur", "Montant total (Ar)", "Statut" });

        for (BonCommande bon : bons) {
            writer.writeNext(new String[] {
                    String.valueOf(bon.getId()),
                    bon.getDateCreation().toString(),
                    bon.getClient().getNom() + " " + bon.getClient().getPrenom(),
                    bon.getVendeur().getNom() + " " + bon.getVendeur().getPrenom(),
                    bon.getMontantTotal().toString(),
                    bon.getStatut()
            });
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] exporterLignesBon(BonCommande bon) {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw, ';', CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, System.lineSeparator());
        writer.writeNext(new String[] { "Produit", "Quantité", "Prix unitaire (Ar)", "Sous-total (Ar)" });

        for (LigneBon ligne : bon.getLignes()) {
            writer.writeNext(new String[] {
                    ligne.getProduit().getNom(),
                    String.valueOf(ligne.getQuantite()),
                    ligne.getPrixUnitaire().toString(),
                    ligne.getSousTotal().toString()
            });
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] exporterCommissions(List<Commission> commissions) {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw, ';', CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, System.lineSeparator());
        writer.writeNext(new String[] { "Vendeur", "Mois", "Année", "Montant ventes (Ar)", "Taux (%)", "Commission (Ar)" });

        for (Commission commission : commissions) {
            writer.writeNext(new String[] {
                    commission.getVendeur().getNom() + " " + commission.getVendeur().getPrenom(),
                    String.valueOf(commission.getMois()),
                    String.valueOf(commission.getAnnee()),
                    commission.getMontantVentes().toString(),
                    commission.getTauxCommission().toString(),
                    commission.getMontantCommission().toString()
            });
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] exporterPaiements(List<Paiement> paiements) {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw, ';', CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, System.lineSeparator());
        writer.writeNext(new String[] { "ID", "Date", "Montant (Ar)", "Mode", "Statut", "Bon n°" });

        for (Paiement paiement : paiements) {
            writer.writeNext(new String[] {
                    String.valueOf(paiement.getId()),
                    paiement.getDatePaiement().toString(),
                    paiement.getMontant().toString(),
                    paiement.getModePaiement(),
                    paiement.getStatut(),
                    String.valueOf(paiement.getBonCommande().getId())
            });
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }

    public byte[] exporterProduits(List<Produit> produits) {
        StringWriter sw = new StringWriter();
        CSVWriter writer = new CSVWriter(sw, ';', CSVWriter.DEFAULT_QUOTE_CHARACTER, CSVWriter.DEFAULT_ESCAPE_CHARACTER, System.lineSeparator());
        writer.writeNext(new String[] { "ID", "Nom", "Référence", "Prix (Ar)", "Stock", "Rayon" });

        for (Produit produit : produits) {
            BigDecimal prix = (produit.getPrix() != null) ? produit.getPrix() : BigDecimal.ZERO;
            writer.writeNext(new String[] {
                    String.valueOf(produit.getId()),
                    produit.getNom(),
                    (produit.getReference() != null) ? produit.getReference() : "",
                    prix.toString(),
                    String.valueOf(produit.getStock()),
                    produit.getRayon().getNom()
            });
        }
        return sw.toString().getBytes(java.nio.charset.StandardCharsets.UTF_8);
    }
}
