import React, { useEffect, useState } from "react";
import "./MdifiClientAccess.css";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import emailjs from "emailjs-com";

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
      const data = querySnapshot.docs.map((docSnap) => ({
        id: docSnap.id,
        ...docSnap.data(),
      }));
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
        setStatut(v.statut || "En attente");
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

      if (action === "modifier") {
        await updateDoc(virementRef, {
          statut,
          motif,
        });

        // 📩 Envoi d'email si statut = Rejeté
        if (statut === "Rejeté") {
          const v = virements.find((item) => item.id === selectedId);

          const templateParams = {
            to_email: v.emailBeneficiaire || "beneficiaire@email.com",
            beneficiaireNom: v.beneficiaireNom || "Non renseigné",
            iban: v.beneficiaireIban || "Non renseigné",
            cleRib: v.beneficiaireCleRib || "Non renseigné",
            bic: v.beneficiaireBic || "Non renseigné",
            beneficiaireBanqueNom: v.beneficiaireBanqueNom || "Non renseigné",
            beneficiaireBanqueAdresse:
              v.beneficiaireBanqueAdresse || "Non renseigné",
            emailBeneficiaire: v.emailBeneficiaire || "Non renseigné",
            montant: v.montant || "Non renseigné",
            devise: v.devise || "EUR",
            motif: motif || "Non précisé",
            statut: statut || "Non précisé",
            dateExecution: v.dateExecution || "Non renseignée",
          };

          await emailjs.send(
            "service_4nk75e8",
            "template_ebp1pjn",
            templateParams,
            "UWYvET8eDModmPseE"
          );

          alert("📩 Mail de rejet envoyé au bénéficiaire.");
        }

        alert("✅ Virement mis à jour avec succès !");
      } else if (action === "supprimer") {
        await deleteDoc(virementRef);
        alert("🗑️ Virement supprimé !");
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
      <h3>Mettre à jour statut du virement</h3>

      <form className="update-client-form" onSubmit={handleSubmit}>
        {/* Sélection du virement */}
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
                {v.beneficiaireNom} - {v.montant} {v.devise} ({v.statut})
              </option>
            ))}
          </select>
        </div>

        {/* Action */}
        <div className="form-group">
          <label>
            Action à effectuer <span className="required">*</span>
          </label>
          <select value={action} onChange={(e) => setAction(e.target.value)}>
            <option value="">-- Choisir une action --</option>
            <option value="modifier">Modifier informations</option>
            <option value="supprimer">Supprimer accès</option>
          </select>
        </div>

        {/* Modification du statut */}
        {action === "modifier" && (
          <>
            <div className="form-group">
              <label>Modifier le statut du virement</label>
              <select
                value={statut}
                onChange={(e) => setStatut(e.target.value)}
              >
                <option value="En attente">En attente</option>
                <option value="En cours">En cours</option>
                <option value="Effectué">Effectué</option>
                <option value="Rejeté">Rejeté</option>
              </select>
            </div>

            {statut === "Rejeté" && (
              <div className="form-group">
                <label>Motif du rejet</label>
                <textarea
                  placeholder="Indiquez le motif du rejet"
                  value={motif}
                  onChange={(e) => setMotif(e.target.value)}
                />
              </div>
            )}
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
