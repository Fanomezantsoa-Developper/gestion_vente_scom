package com.sgvc.sgvc_backend.service.export;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import com.sgvc.sgvc_backend.entity.BonCommande;
import com.sgvc.sgvc_backend.entity.Commission;
import com.sgvc.sgvc_backend.entity.LigneBon;
import com.sgvc.sgvc_backend.entity.Paiement;
import org.springframework.stereotype.Service;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;
import java.util.Locale;

// Génération des documents PDF : facture, reçu de paiement, bulletin de commission
@Service
public class PdfExportService {

    private static final DateTimeFormatter DATE_HEURE = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    private static final DateTimeFormatter MOIS = DateTimeFormatter.ofPattern("MMMM yyyy", Locale.FRENCH);

    public byte[] genererPdfBon(BonCommande bon) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            titre(document, "BON DE COMMANDE n°" + bon.getId());
            document.add(ligneSimple("Date : " + bon.getDateCreation().format(DATE_HEURE)));
            document.add(ligneSimple("Statut : " + bon.getStatut()));
            document.add(new Paragraph(" "));

            document.add(enteteSection("Client"));
            document.add(ligneSimple(bon.getClient().getNom() + " " + bon.getClient().getPrenom()));
            document.add(ligneSimple(bon.getClient().getTelephone() != null ? bon.getClient().getTelephone() : ""));
            document.add(ligneSimple(bon.getClient().getAdresse() != null ? bon.getClient().getAdresse() : ""));
            document.add(new Paragraph(" "));

            document.add(enteteSection("Vendeur"));
            document.add(ligneSimple(bon.getVendeur().getNom() + " " + bon.getVendeur().getPrenom()));
            document.add(new Paragraph(" "));

            // Tableau des lignes
            PdfPTable table = new PdfPTable(4);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(10);
            enTeteTableau(table, "Produit", "Quantité", "Prix unitaire (Ar)", "Sous-total (Ar)");

            for (LigneBon ligne : bon.getLignes()) {
                table.addCell(cellule(ligne.getProduit().getNom()));
                table.addCell(cellule(String.valueOf(ligne.getQuantite())));
                table.addCell(cellule(ligne.getPrixUnitaire().toString()));
                table.addCell(cellule(ligne.getSousTotal().toString()));
            }
            document.add(table);

            document.add(enteteSection("TOTAL : " + bon.getMontantTotal() + " Ar"));

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF du bon", e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    public byte[] genererPdfRecu(Paiement paiement) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            titre(document, "REÇU DE PAIEMENT n°" + paiement.getId());
            document.add(ligneSimple("Date : " + paiement.getDatePaiement().format(DATE_HEURE)));
            document.add(ligneSimple("Mode de paiement : " + paiement.getModePaiement()));
            document.add(ligneSimple("Statut : " + paiement.getStatut()));
            document.add(new Paragraph(" "));

            document.add(enteteSection("Bon de commande concerné"));
            document.add(ligneSimple("Bon n° " + paiement.getBonCommande().getId()));
            document.add(ligneSimple("Date du bon : " + paiement.getBonCommande().getDateCreation().format(DATE_HEURE)));
            document.add(ligneSimple("Client : " + paiement.getBonCommande().getClient().getNom() + " "
                    + paiement.getBonCommande().getClient().getPrenom()));
            document.add(new Paragraph(" "));

            document.add(enteteSection("MONTANT PAYÉ : " + paiement.getMontant() + " Ar"));

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF du reçu", e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    public byte[] genererPdfCommission(Commission commission) {
        Document document = new Document();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        try {
            PdfWriter.getInstance(document, out);
            document.open();

            titre(document, "BULLETIN DE COMMISSION");
            document.add(ligneSimple("Période : " + commission.getMois() + " / " + commission.getAnnee()));
            document.add(new Paragraph(" "));

            document.add(enteteSection("Vendeur"));
            document.add(ligneSimple(commission.getVendeur().getNom() + " " + commission.getVendeur().getPrenom()));
            document.add(new Paragraph(" "));

            PdfPTable table = new PdfPTable(2);
            table.setWidthPercentage(100);
            table.setSpacingBefore(10);
            table.setSpacingAfter(10);
            enTeteTableau(table, "Rubrique", "Valeur");
            table.addCell(cellule("Montant des ventes (Ar)"));
            table.addCell(cellule(commission.getMontantVentes().toString()));
            table.addCell(cellule("Taux de commission (%)"));
            table.addCell(cellule(commission.getTauxCommission().toString()));
            table.addCell(cellule("Commission du mois (Ar)"));
            table.addCell(cellule(commission.getMontantCommission().toString()));
            document.add(table);

        } catch (DocumentException e) {
            throw new RuntimeException("Erreur lors de la génération du PDF de la commission", e);
        } finally {
            document.close();
        }
        return out.toByteArray();
    }

    // ------------------------------------------------------------------
    // Helpers d'écriture
    // ------------------------------------------------------------------

    private void titre(Document document, String texte) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
        Paragraph titre = new Paragraph(texte, font);
        titre.setAlignment(Element.ALIGN_CENTER);
        document.add(titre);
        document.add(new Paragraph(" "));
    }

    private Paragraph enteteSection(String texte) {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
        Paragraph paragraph = new Paragraph(texte, font);
        paragraph.setSpacingBefore(6);
        paragraph.setSpacingAfter(4);
        return paragraph;
    }

    private Paragraph ligneSimple(String texte) {
        return new Paragraph(texte, FontFactory.getFont(FontFactory.HELVETICA, 11));
    }

    private void enTeteTableau(PdfPTable table, String... colonnes) {
        for (String colonne : colonnes) {
            Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
            PdfPCell cell = new PdfPCell(new Phrase(colonne, font));
            cell.setPadding(4);
            table.addCell(cell);
        }
    }

    private PdfPCell cellule(String texte) {
        PdfPCell cell = new PdfPCell(new Phrase(texte, FontFactory.getFont(FontFactory.HELVETICA, 10)));
        cell.setPadding(4);
        return cell;
    }
}
