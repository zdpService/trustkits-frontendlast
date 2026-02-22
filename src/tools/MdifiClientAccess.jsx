import React, { useEffect, useState } from "react";
import "./MdifiClientAccess.css";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  // deleteDoc supprimé car on ne détruit plus physiquement les données
} from "firebase/firestore";
import emailjs from "@emailjs/browser";

import { TRANSLATIONS } from "../translate/translations"; 
import { NOT_FOUND_TRANSLATIONS } from "../translate/NotfoundTranslate";

const EMAILJS_SERVICE_ID = "service_ua2vb9u";
const EMAILJS_TEMPLATE_ID = "template_ebp1pjn"; 
const EMAILJS_PUBLIC_KEY = "UWYvET8eDModmPseE";

const DATE_OPTIONS = { day: '2-digit', month: '2-digit', year: 'numeric' };

const MdifiClientAccess = () => {
  const [virements, setVirements] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [action, setAction] = useState("");
  const [statut, setStatut] = useState("En attente");
  const [motif, setMotif] = useState(""); 
  const [loading, setLoading] = useState(false);

  const fetchVirements = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "virements"));
      const data = querySnapshot.docs
        .map((docSnap) => ({
          id: docSnap.id,
          ...docSnap.data(),
        }))
        // 🔴 On filtre ici aussi pour que l'admin ne voie plus les virements masqués
        .filter(v => v.masquePourClient !== true);
        
      setVirements(data);
    } catch (error) {
      console.error("Erreur lors du chargement des virements :", error);
    }
  };

  useEffect(() => {
    fetchVirements();
  }, []);

  useEffect(() => {
    if (selectedId) {
      const v = virements.find((item) => item.id === selectedId);
      if (v) {
        setStatut(v.statutVirement || "En attente");
        setMotif(v.motif || "");
      }
    }
  }, [selectedId, virements]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedId) {
      alert("Veuillez sélectionner un virement.");
      return;
    }

    setLoading(true);

    try {
      const virementRef = doc(db, "virements", selectedId);
      const v = virements.find((item) => item.id === selectedId);

      if (action === "modifier") {
        await updateDoc(virementRef, {
          statutVirement: statut,
          statutMessage: statut === "Effectué" || statut === "Rejeté" ? "Envoyé" : "En attente",
          motif: motif, 
        });

        if (statut === "Rejeté" || statut === "Effectué") {
          const clientLang = v.langue || "Français";
          const t_email = TRANSLATIONS[clientLang] || TRANSLATIONS["Français"];
          const t_notfound = NOT_FOUND_TRANSLATIONS[clientLang] || NOT_FOUND_TRANSLATIONS["Français"];

          const montantFormate = new Intl.NumberFormat(clientLang === "Anglais" ? "en-US" : "fr-FR", {
            style: "currency", currency: v.devise || "EUR", minimumFractionDigits: 2
          }).format(v.montant);

          const dateEmail = new Date(v.dateExecution).toLocaleDateString("fr-FR", DATE_OPTIONS);

          let subjectLine = "";
          let introMessage = "";
          let greetingText = "";
          let badgeText = "";
          let statusColor = "#003366"; 
          let badgeBg = "#e0f2fe";
          let badgeColor = "#0369a1";

          if (statut === "Rejeté") {
            subjectLine = t_notfound.subject;
            greetingText = t_notfound.greeting; 
            badgeText = t_notfound.status_badge || "REJETÉ"; 

            let rawMessage = t_notfound.message_body || t_notfound.message; 
            
            introMessage = rawMessage
              .replace("{{recipient}}", v.beneficiaireNom)
              .replace("{{amount}}", montantFormate)
              .replace("{{sender}}", v.debiteurNom)
              .replace("{{date}}", dateEmail)
              .replace("{{iban}}", v.beneficiaireIban)
              .replace("{{bank}}", v.beneficiaireBanqueNom)
              .replace("{{recipient}}", v.beneficiaireNom); 

            statusColor = "#b91c1c"; 
            badgeBg = "#fee2e2";    
            badgeColor = "#991b1b";  

          } 
          else {
            subjectLine = t_email.email_subject;
            greetingText = t_email.greeting;
            badgeText = "EFFECTUÉ";

            introMessage = t_email.intro_message;
            introMessage = introMessage.replace("{{debiteurNom}}", v.debiteurNom);
          }

          const templateParams = {
            to_email: v.emailBeneficiaire,
            subject: subjectLine,
            logo_banque: "https://cdn-icons-png.flaticon.com/128/3936/3936759.png",
            debiteurBanque: v.debiteurBanque || "Banque",
            t_greeting: greetingText,
            t_intro: introMessage, 
            t_label_amount: t_email.label_amount,
            montant: montantFormate,
            statutVirement: badgeText, 
            status_color: statusColor, 
            badge_bg: badgeBg,
            badge_color: badgeColor,
            t_label_sender: t_email.label_sender,
            debiteurNom: v.debiteurNom,
            t_label_beneficiary_name: t_email.label_beneficiary_name || "Bénéficiaire",
            beneficiaireNom: v.beneficiaireNom,
            t_label_execution_date: t_email.label_execution_date || "Date",
            t_formatted_date: dateEmail,
            t_label_motive: t_email.label_motive,
            motif: motif || v.motif, 
            t_label_iban: t_email.label_iban || "IBAN",
            iban: v.beneficiaireIban,
            t_label_bic: t_email.label_bic || "BIC",
            bic: v.beneficiaireBic,
            t_label_key: t_email.label_key,
            cleRib: v.beneficiaireCleRib,
            t_label_bank: t_email.label_bank,
            beneficiaireBanqueNom: v.beneficiaireBanqueNom,
            t_label_bank_address: t_email.label_bank_address || "Adresse",
            beneficiaireBanqueAdresse: v.beneficiaireBanqueAdresse,
            t_label_country: t_email.label_country || "Pays",
            paysDestination: v.paysDestination,
            t_footer_auto: t_email.footer_auto,
            t_footer: t_email.footer_contact,
            t_footer_security: t_email.footer_security,
            virement_id: v.id,
            tracking_url: `https://hook.eu1.make.com/cuwiz9924ms451u5n7eegtmj2is21lwh?id=${v.id}`
          };

          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            templateParams,
            EMAILJS_PUBLIC_KEY
          );

          alert(`Email ${statut === "Rejeté" ? "de blocage" : "de confirmation"} envoyé avec succès.`);
        } else {
          alert("✅ Statut mis à jour (sans envoi d'email).");
        }

      } else if (action === "supprimer") {
        // 🔴 CORRECTION ICI : Soft Delete pour ne pas faire crasher Make !
        await updateDoc(virementRef, {
          masquePourClient: true
        });
        alert("🗑️ Virement masqué avec succès !");
        setSelectedId("");
      }

      await fetchVirements();
    } catch (error) {
      console.error("Erreur :", error);
      alert("❌ Erreur : " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="update-client-access">
      <h3>Gestion des Virements Clients</h3>

      <form className="update-client-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label>
            Sélectionner un virement <span className="required">*</span>
          </label>
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
          >
            <option value="">-- Choisir un virement --</option>
            {virements.map((v) => (
              <option key={v.id} value={v.id}>
                {v.beneficiaireNom} - {v.montant} {v.devise} ({v.statutVirement || "En attente"})
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>
            Action à effectuer <span className="required">*</span>
          </label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">-- Choisir une action --</option>
            <option value="modifier">Modifier statut & Notifier</option>
            <option value="supprimer">Supprimer le virement</option>
          </select>
        </div>

        {action === "modifier" && (
          <>
            <div className="form-group">
              <label>Nouveau Statut</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
                style={{ border: statut === "Rejeté" ? "2px solid red" : "1px solid #ccc" }}
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Effectué">Effectué (Email Succès)</option>
                <option value="Rejeté">Rejeté (Email Blocage Rouge)</option>
              </select>
            </div>

            <div className="form-group">
              <label>Motif / Raison</label>
              <textarea
                placeholder={statut === "Rejeté" ? "Raison précise du blocage..." : "Motif du virement..."}
                value={motif}
                onChange={(e) => setMotif(e.target.value)}
                rows={3}
              />
              {statut === "Rejeté" && <small style={{color:'red'}}>Ce texte remplacera le motif sur le reçu.</small>}
            </div>
          </>
        )}

        <button type="submit" className="update-btn" disabled={loading}>
          {loading ? "Traitement..." : "Appliquer l'action →"}
        </button>
      </form>
    </div>
  );
};

export default MdifiClientAccess;