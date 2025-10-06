// src/utilities/layout pages/OutilsAccesPayant.js
import "./OutilsAccesPayant.css";

const CheckIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    style={{
      height: "18px",
      width: "18px",
      marginRight: "8px",
      color: "#16a34a",
      flexShrink: 0,
    }}
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="m4.5 12.75 6 6 9-13.5"
    />
  </svg>
);

const LigneAvecCheck = ({ texte }) => (
  <p style={{ display: "flex", alignItems: "center" }}>
    <CheckIcon />
    {texte}
  </p>
);

const OutilsAccesPayant = () => {
  return (
    <section className="newSection">
      {/* Header */}
      <div
        style={{
          padding: "20px",
          background: "#ffffff",
          borderBottom: "1.1px solid rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <span style={{ fontWeight: "bold" }}>Outils à accès payant</span>
      </div>

      {/* Liste */}
      <section className="acces-payants">
        {/* SMS Pro */}
        <h2 className="outil-title">SMS Pro :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard (70 Caractères => 1 SMS) : 1000 Crédits" />
          <LigneAvecCheck texte="Tarif Double (140 Caractères => 2 SMS) : 2000 Crédits" />
          <LigneAvecCheck texte="Tarif triple (210 Caractères => 3 SMS) : 3000 Crédits" />
          <LigneAvecCheck texte="Etc..." />
        </div>

        {/* Mail Flash Pro */}
        <h2 className="outil-title">Mail Flash Pro :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard (Caractères illimités) : 1000 Crédits" />
          <LigneAvecCheck texte="Avec fichier joint (image, Word, PDF) : 2000 Crédits" />
        </div>

        {/* Mail Pro Privé */}
        <h2 className="outil-title">Mail Pro Privé :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif défini selon l’extension du nom de domaine ciblé" />
        </div>

        {/* Flash Compte Pro v1 */}
        <h2 className="outil-title">Flash Compte Pro v1 :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 4000 Crédits" />
          <LigneAvecCheck texte="Ajout des alertes par e-mail : Gratuit" />
          <LigneAvecCheck texte="Ajout des alertes par sms : 1000 Crédits" />
        </div>

        {/* Flash Compte Pro v2 */}
        <h2 className="outil-title">Flash Compte Pro v2 :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 5000 Crédits" />
          <LigneAvecCheck texte="Ajout des alertes par e-mail : Gratuit" />
        </div>

        {/* Collecte de code coupon */}
        <h2 className="outil-title">Collecte de code coupon :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 3000 Crédits" />
        </div>

        {/* Vérification IBAN / CB */}
        <h2 className="outil-title">Vérification IBAN / CB :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 500 Crédits" />
        </div>

        {/* Vérification Email */}
        <h2 className="outil-title">Vérification d’un e-mail :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 500 Crédits" />
        </div>

        {/* Vérification numéro */}
        <h2 className="outil-title">Vérification d’un numéro de téléphone :</h2>
        <div className="outil-card">
          <LigneAvecCheck texte="Tarif Standard : 500 Crédits" />
        </div>
      </section>
    </section>
  );
};

export default OutilsAccesPayant;
