import React from "react";
import { Link } from "react-router-dom";
import "./ClientAccessDetails.css";

const ClientAccessDetails = () => {
  const data = {
    hashLien: "MW1pcn",
    lienRaccourci: "https://weblnk.cc/MW1pcn",
    lienConnexion: "https://vantex.finance/?cl=MW1pcn",
    email: "irinapetrova@myyahoo.com",
    codePin: "071975",
    nomPrenom: "PETROVA IRINA",
    tel: "N/A",
    pays: "🇧🇬 Bulgarie",
    adresse: "MARIADORF",
    langue: "BG (Code ISO)",
    couleurInterface: "",
    solde: "78 600,00 €",
    notif: "N/A",
    pourcentageDepart: "0",
    pourcentageArret: "95%",
    messageVirement:
      "Erreur de transfert.\nVotre compte est temporairement bloqué. Un frais unique de déblocage de 7.600€ est requis pour réactiver l’accès complet à vos services.",
    codeActivation: "948BD1AD",
    codeUtilise: "OUI",
    alertes: "Activé",
    coutCreation: "5000 Crédits",
    dateCreation: "28/09/25 à 15:57 UTC+0",
    etat: "Flash Compte actif",
  };

  return (
    <div className="client-access-details">
      <h2>Détails de l'accès client</h2>

      <section className="section">
        <h3>Informations générales</h3>
        <p>
          <strong>Hash du lien :</strong> {data.hashLien}
        </p>
        <p>
          Utilisez le lien raccourci ou lien de connexion et les identifiants
          ci-dessous pour la connexion à l'accès flash compte client.
        </p>
        <p>
          <strong>Lien raccourci :</strong>{" "}
          <Link
            to={data.lienRaccourci}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.lienRaccourci}
          </Link>
        </p>
        <p>
          <strong>Lien de connexion :</strong>{" "}
          <Link
            to={data.lienConnexion}
            target="_blank"
            rel="noopener noreferrer"
          >
            {data.lienConnexion}
          </Link>
        </p>
        <p>
          <strong>Adresse e-mail :</strong> {data.email}
        </p>
        <p>
          <strong>Code Pin :</strong> {data.codePin}
        </p>
      </section>

      <section className="section">
        <h3>Informations sur le client</h3>
        <p>
          <strong>Nom Prénom :</strong> {data.nomPrenom}
        </p>
        <p>
          <strong>Adresse e-mail :</strong> {data.email}
        </p>
        <p>
          <strong>Numéro de téléphone :</strong> {data.tel}
        </p>
        <p>
          <strong>Pays de résidence :</strong> {data.pays}
        </p>
        <p>
          <strong>Adresse de résidence :</strong> {data.adresse}
        </p>
        <p>
          <strong>Langue du client :</strong> {data.langue}
        </p>
        <p>
          <strong>Couleur de l'interface :</strong>{" "}
          {data.couleurInterface || "N/A"}
        </p>
      </section>

      <section className="section">
        <h3>Solde du compte et virement</h3>
        <p>
          <strong>Solde du compte :</strong> {data.solde}
        </p>
        <p>
          L’historique des virements est disponible. Veuillez vous connecter
          directement à l'accès client afin de voir plus de détails.
        </p>
        <p>
          <strong>Notification :</strong> {data.notif}
        </p>
        <p>
          <strong>Pourcentage de départ :</strong> {data.pourcentageDepart}
        </p>
        <p>
          <strong>Pourcentage d'arrêt :</strong> {data.pourcentageArret}
        </p>
        <p>
          <strong>Message après virement :</strong>
          <br />
          {data.messageVirement}
        </p>
        <p>
          <strong>Code d'activation :</strong> {data.codeActivation}
        </p>
        <p>
          <strong>Code d'activation déjà utilisé :</strong> {data.codeUtilise}
        </p>
      </section>

      <section className="section">
        <h3>Autres informations</h3>
        <p>
          <strong>Alertes par e-mail :</strong> {data.alertes}
        </p>
        <p>
          <strong>Coût de création :</strong> {data.coutCreation}
        </p>
        <p>
          <strong>Date de création :</strong> {data.dateCreation}
        </p>
        <p>
          <strong>Etat :</strong> {data.etat}
        </p>
      </section>
    </div>
  );
};

export default ClientAccessDetails;
