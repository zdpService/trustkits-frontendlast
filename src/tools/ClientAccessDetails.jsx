import { Link } from "react-router-dom";
import "./ClientAccessDetails.css";

const ClientAccessDetails = ({ client }) => {
  const data = client;

  if (!data) return null;

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
          <strong>Numéro de téléphone :</strong> {data.telephone || data.tel}
        </p>
        <p>
          <strong>Pays de résidence :</strong> {data.paysResidence}
        </p>
        <p>
          <strong>Adresse de résidence :</strong> {data.adresseResidence}
        </p>
        <p>
          <strong>Langue du client :</strong> {data.langueClient}
        </p>
        <p>
          <strong>Couleur de l'interface :</strong>{" "}
          {data.couleurInterface || "N/A"}
        </p>
      </section>

      <section className="section">
        <h3>Solde du compte et virement</h3>
        <p>
          <strong>Solde du compte :</strong> {data.soldeCompte}
        </p>
        <p>
          L’historique des virements est disponible. Veuillez vous connecter
          directement à l'accès client afin de voir plus de détails.
        </p>
        <p>
          <strong>Notification :</strong> {data.notification}
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
          {data.messageApresVirement}
        </p>
        <p>
          <strong>Code d'activation :</strong> {data.codeTransfert || "N/A"}
        </p>
        <p>
          <strong>Code d'activation déjà utilisé :</strong>{" "}
          {data.codeActivationUtilise}
        </p>
      </section>

      <section className="section">
        <h3>Autres informations</h3>
        <p>
          <strong>Alertes par e-mail :</strong> {data.alertesEmail}
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
