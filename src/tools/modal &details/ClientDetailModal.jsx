import "./ClientDetailModal.css";

const ClientDetailModal = ({ client, onClose }) => {
  console.log(
    "ClientDetailModal: Données client reçues pour le diagnostic.",
    client
  );

  if (!client) return null;

  const displayValue = (value) => {
    if (value === null || value === undefined) {
      return "N/A";
    }
    if (typeof value === "string" && value.trim() === "") {
      return "N/A";
    }
    if (typeof value === "object" && value.toDate) {
      return value.toDate().toLocaleString();
    }
    return String(value) === "0" ? "0" : String(value);
  };

  const getNumericField = (primary, secondary, fallback = 0) => {
    const checkValue = (value) => {
      if (typeof value === "number" && !isNaN(value)) return value;

      if (typeof value === "string" && value.trim() !== "") {
        const num = parseFloat(value);
        if (!isNaN(num)) return num;
      }
      return null;
    };

    const primaryValue = checkValue(primary);
    if (primaryValue !== null) return primaryValue;

    const secondaryValue = checkValue(secondary);
    if (secondaryValue !== null) return secondaryValue;

    return fallback;
  };

  const DetailSection = ({ title, children }) => (
    <div className="modal-section">
      <h4 className="modal-section-title">{title}</h4>
      <div className="modal-section-content">{children}</div>
    </div>
  );

  const DetailRow = ({
    label,
    value,
    emphasis = false,
    isLink = false,
    statusStyle = null,
    className = "",
  }) => (
    <p className={`detail-row ${className}`}>
      <span className="detail-label">{label} :</span>
      <span
        className={`detail-value ${emphasis ? "emphasis" : ""}`}
        style={statusStyle || {}}
      >
        {isLink && displayValue(value) !== "N/A" ? (
          <a href={value} target="_blank" rel="noopener noreferrer">
            {displayValue(value)}
          </a>
        ) : (
          displayValue(value)
        )}
      </span>
    </p>
  );

  const codeActivationStatus =
    client.codeActivationUtilise === true ||
    client.codeActivationUtilise === "OUI"
      ? "OUI"
      : "NON";

  const statusValueStyle =
    codeActivationStatus === "OUI"
      ? {
          backgroundColor: "#e87e22",
          color: "#ffffff",
          padding: "2px 6px",
          borderRadius: "4px",
        }
      : {
          backgroundColor: "#07012f",
          color: "#ffffff",
          padding: "2px 6px",
          borderRadius: "4px",
        };

  const virementMessage = client.stopMessage || client.messageApresVirement;

  const pourcentageDepart = getNumericField(
    client.percentageStart,
    client.pourcentageDepart
  );
  const pourcentageArret = getNumericField(
    client.percentageStop,
    client.pourcentageArret
  );

  const soldeAffiche =
    client.soldeCompte ||
    (client.solde ? `${client.solde} ${client.devise || ""}` : null);

  const codeDeVirement =
    typeof client.codeActivationVirement === "string" &&
    client.codeActivationVirement.trim() !== ""
      ? client.codeActivationVirement
      : typeof client.codeTransfert === "string" &&
        client.codeTransfert.trim() !== ""
      ? client.codeTransfert
      : null;

  const isVirementComplete = pourcentageArret === 100;

  const messageStyle = isVirementComplete
    ? {
        backgroundColor: "rgb(193, 189, 223)", // Ancien: #fdeaea
        color: "#07012f", // Ancien: #e74c3c
        borderLeft: "5px solid #07012f",
      }
    : {
        backgroundColor: "#fdeaea",
        color: "#e74c3c",
        borderLeft: "5px solid #e74c3c",
      };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-contents" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close-button" onClick={onClose}>
          &times;
        </button>

        <h3 className="modal-title">Détails de l'accès client</h3>

        <DetailSection title="Détails de l'accès">
          <DetailRow
            label="Lien de connexion"
            value={client.lienConnexion}
            isLink
          />
          <DetailRow label="Adresse e-mail" value={client.email} />

          <DetailRow label="Code Pin" value={client.codePin} emphasis />
        </DetailSection>

        <DetailSection title="Informations sur le client">
          <DetailRow label="Nom Prénom" value={client.nomPrenom} />
          <DetailRow label="Pays de résidence" value={client.paysResidence} />
          <DetailRow
            label="Adresse de résidence"
            value={client.adresseResidence}
          />
          <DetailRow label="Numéro de téléphone" value={client.telephone} />
          <DetailRow label="Langue du client" value={client.langueClient} />
          <DetailRow
            label="Couleur de l'interface"
            value={client.couleurInterface}
          />
        </DetailSection>

        <DetailSection title="Solde du compte et virement">
          <DetailRow label="Solde du compte" value={soldeAffiche} emphasis />

          <DetailRow
            label="Pourcentage de départ du virement"
            value={`${displayValue(pourcentageDepart)}%`}
          />
          <DetailRow
            label="Pourcentage d'arrêt du virement"
            value={`${displayValue(pourcentageArret)}%`}
          />
          <DetailRow
            label="Code d'activation du virement"
            value={codeDeVirement}
            emphasis={displayValue(codeDeVirement) !== "N/A"}
          />

          <DetailRow
            statusStyle={statusValueStyle}
            label="Code d'activation déjà utilisé"
            value={codeActivationStatus}
            emphasis={codeActivationStatus === "OUI"}
          />
        </DetailSection>

        {virementMessage && displayValue(virementMessage) !== "N/A" && (
          <DetailSection title="message à afficher">
            <p className="virement-message" style={messageStyle}>
              {displayValue(virementMessage)}
            </p>
          </DetailSection>
        )}

        <DetailSection title="Autres Informations">
          <DetailRow label="Alertes par e-mail" value={client.alertesEmail} />
          <DetailRow label="Coût de création" value={client.coutCreation} />
          <DetailRow label="Date de création" value={client.dateCreation} />
          <DetailRow label="État du compte" value={client.etat} emphasis />
        </DetailSection>
      </div>
    </div>
  );
};

export default ClientDetailModal;
