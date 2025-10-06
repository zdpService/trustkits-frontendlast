import React from "react";
import { useLocation } from "react-router-dom";
import "./TextComponent.css";

const TextComponent = () => {
  const location = useLocation();
  const { virementData } = location.state || {}; // récupère les données passées depuis VirementForm

  if (!virementData) {
    return <p>Aucune donnée de virement trouvée.</p>;
  }

  return (
    <div className="bordereau-container">
      {/* Header avec logo et infos expéditeur */}
      <div className="bordereau-header">
        <div className="logo">
          <img
            src="https://upload.wikimedia.org/wikipedia/fr/thumb/5/50/Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale.svg/2560px-Soci%C3%A9t%C3%A9_G%C3%A9n%C3%A9rale.svg.png"
            alt="Société Générale"
          />
          <p>Banque & Assurances</p>
        </div>
        <div className="sender-info">
          <p>Mme./M. {virementData.debiteurNom}</p>
          <p className="date">
            {new Date().toLocaleDateString("fr-FR", {
              day: "2-digit",
              month: "2-digit",
              year: "numeric",
            })}
          </p>
        </div>
      </div>

      {/* Titre */}
      <h2 className="title">Bordereau de virement bancaire</h2>

      {/* Texte d’introduction */}
      <p>
        Nous vous confirmons par la présente attestation, l’émission du virement
        suivant depuis le compte :
      </p>

      {/* Infos Donneur d’ordre */}
      <div className="section">
        <h3>DONNEUR D’ORDRE :</h3>
        <p>Nom du donneur d’ordre : {virementData.debiteurNom}</p>
        <p>Compte du donneur d’ordre : {virementData.beneficiaireIban}</p>
        <p>
          Montant : {virementData.montant} {virementData.devise}
        </p>
      </div>

      {/* Infos Destinataire */}
      <div className="section">
        <h3>DESTINATAIRE :</h3>
        <p>Nom du bénéficiaire : {virementData.beneficiaireNom}</p>
        <p>Libellé : {virementData.motif}</p>
        <p>IBAN : {virementData.beneficiaireIban}</p>
        <p>BIC : {virementData.beneficiaireBic}</p>
        <p>
          Date de règlement :{" "}
          {new Date(virementData.dateExecution).toLocaleDateString("fr-FR")}
        </p>
        <p>
          Numéro d’opération :{" "}
          {Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15)}
        </p>
      </div>

      {/* Footer */}
      <p className="footer-text">
        Bonne journée, <br />
        L’équipe <strong>Société Générale</strong>
      </p>

      {/* Signature */}
      <div className="signature">[Signature]</div>
    </div>
  );
};

export default TextComponent;
