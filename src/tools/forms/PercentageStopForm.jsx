import React, { useState } from "react";

const PercentageStopForm = ({
  clientData,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => {
  // Initialisation des états avec les valeurs actuelles du client ou par défaut
  const [startPercentage, setStartPercentage] = useState(
    clientData?.pourcentageDepart || 0
  );
  const [stopPercentage, setStopPercentage] = useState(
    clientData?.pourcentageArret || 0
  );
  const [stopMessage, setStopMessage] = useState(
    clientData?.messageApresVirement || ""
  );
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    const start = parseFloat(startPercentage);
    const stop = parseFloat(stopPercentage);

    // Validation des données
    if (
      isNaN(start) ||
      isNaN(stop) ||
      start < 0 ||
      stop < 0 ||
      start > 100 ||
      stop > 100
    ) {
      setLocalError(
        "Veuillez entrer des pourcentages valides (entre 0 et 100)."
      );
      return;
    }

    if (start >= stop) {
      setLocalError(
        "Le pourcentage d'arrêt doit être strictement supérieur au pourcentage de début."
      );
      return;
    }

    if (!stopMessage.trim()) {
      setLocalError(
        "Veuillez saisir un message à afficher lors de l'arrêt du virement."
      );
      return;
    }

    // Appel de la fonction de soumission du composant parent
    onSubmit({
      percentageStart: start,
      percentageStop: stop,
      stopMessage: stopMessage.trim(),
    });
  };

  const characterCount = stopMessage.length;
  const maxLength = 300;

  return (
    <div
      style={{
        paddingTop: "1rem",
      }}
      className="action-form"
    >
      {/* Affichage des erreurs globales (du parent) ou locales */}
      {(error || localError) && (
        <p className="alert alert-danger">{error || localError}</p>
      )}
      {success && <p className="alert alert-success">{success}</p>}

      <div
        className="alert alert-info"
        role="alert"
        style={{ marginBottom: "1rem" }}
      >
        <strong>ℹ️ Comment ça fonctionne :</strong>
        <ul style={{ marginBottom: 0, paddingLeft: "20px", marginTop: "8px" }}>
          <li>
            <strong>Pourcentage de début</strong> : Le virement commence à cette
            progression (ex: 0% = début immédiat)
          </li>
          <li>
            <strong>Pourcentage d'arrêt</strong> : Le virement s'arrête à cette
            progression (ex: 50% = arrêt à mi-parcours)
          </li>
          <li>
            Si arrêt &lt; 100%, le virement échouera et le message sera affiché
            au client
          </li>
        </ul>
      </div>

      <form onSubmit={handleSubmit} className="form-group">
        {/* Ligne des pourcentages */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1.5rem",
          }}
        >
          <div style={{ width: "100%" }}>
            <label htmlFor="startPercentage" className="form-label">
              Pourcentage de Début (%)
              <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="number"
              id="startPercentage"
              name="startPercentage"
              className="form-control"
              value={startPercentage}
              onChange={(e) => setStartPercentage(e.target.value)}
              min="0"
              max="100"
              step="1"
              required
              disabled={isSubmitting}
              style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            />
            <small className="form-text text-muted">
              Valeur actuelle: {clientData?.pourcentageDepart || 0}%
            </small>
          </div>

          <div style={{ width: "100%" }}>
            <label htmlFor="stopPercentage" className="form-label">
              Pourcentage d'Arrêt (%)
              <span style={{ color: "red" }}> *</span>
            </label>
            <input
              type="number"
              id="stopPercentage"
              name="stopPercentage"
              className="form-control"
              value={stopPercentage}
              onChange={(e) => setStopPercentage(e.target.value)}
              min="0"
              max="100"
              step="1"
              required
              disabled={isSubmitting}
              style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            />
            <small className="form-text text-muted">
              Valeur actuelle: {clientData?.pourcentageArret || 0}%
            </small>
          </div>
        </div>

        {/* Aperçu visuel */}
        <div className="mb-3">
          <label className="form-label">Aperçu de la progression :</label>
          <div
            style={{
              position: "relative",
              height: "40px",
              background: "#e9ecef",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                left: `${startPercentage}%`,
                width: `${Math.max(0, stopPercentage - startPercentage)}%`,
                height: "100%",
                background:
                  stopPercentage < 100
                    ? "linear-gradient(90deg, #28a745 0%, #dc3545 100%)"
                    : "linear-gradient(90deg, #28a745 0%, #28a745 100%)",
                transition: "all 0.3s ease",
              }}
            />
            <div
              style={{
                position: "absolute",
                left: `${startPercentage}%`,
                top: "50%",
                transform: "translateY(-50%)",
                fontSize: "12px",
                color: "#000",
                fontWeight: "bold",
                paddingLeft: "8px",
              }}
            >
              {startPercentage}%
            </div>
            <div
              style={{
                position: "absolute",
                left: `${stopPercentage}%`,
                top: "50%",
                transform: "translate(-100%, -50%)",
                fontSize: "12px",
                color: "#fff",
                fontWeight: "bold",
                paddingRight: "8px",
              }}
            >
              {stopPercentage}%
            </div>
          </div>
          <small
            className="form-text"
            style={{
              color: stopPercentage < 100 ? "#dc3545" : "#28a745",
              fontWeight: "600",
            }}
          >
            {stopPercentage < 100
              ? `⚠️ Le virement s'arrêtera à ${stopPercentage}% et échouera`
              : `✓ Le virement se terminera avec succès`}
          </small>
        </div>

        {/* Message d'arrêt */}
        <div className="mb-3">
          <label htmlFor="stopMessage" className="form-label">
            Message à afficher lors de l'arrêt du virement
            <span style={{ color: "red" }}> *</span>
          </label>
          <textarea
            id="stopMessage"
            name="stopMessage"
            className="form-control"
            rows="4"
            value={stopMessage}
            onChange={(e) => setStopMessage(e.target.value.slice(0, maxLength))}
            required
            placeholder="Ex: Votre virement nécessite une validation supplémentaire. Veuillez contacter le service client."
            disabled={isSubmitting}
            style={{ fontFamily: "'Cabin', sans-serif" }}
          />
          <div
            className="form-text"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            <span>
              {clientData?.messageApresVirement && <>Message actuel défini</>}
            </span>
            <span
              style={{
                color: characterCount > maxLength * 0.9 ? "#dc3545" : "#6c757d",
              }}
            >
              {characterCount} / {maxLength}
            </span>
          </div>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Mise à jour en cours...
              </>
            ) : (
              <>
                Mettre à jour les pourcentages
                <i className="bi bi-arrow-right-short"></i>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PercentageStopForm;
