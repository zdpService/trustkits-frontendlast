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
    clientData?.percentageStart || 0
  );
  const [stopPercentage, setStopPercentage] = useState(
    clientData?.percentageStop || 0
  );
  // 🚀 NOUVEL ÉTAT POUR LE MESSAGE D'ARRÊT
  const [stopMessage, setStopMessage] = useState(clientData?.stopMessage || "");
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

    // Appel de la fonction de soumission du composant parent
    onSubmit({
      percentageStart: start,
      percentageStop: stop,
      // 🚀 AJOUT DU NOUVEAU CHAMP DANS LES DONNÉES SOUMISES
      stopMessage: stopMessage,
    });
  };

  return (
    <div
      style={{
        paddingTop: "1rem",
      }}
      className="action-form"
    >
      {/* <h4>Mise à jour du Pourcentage d'Arrêt de Virement</h4> */}
      {/* Affichage des erreurs globales (du parent) ou locales */}
      {(error || localError) && (
        <p className="alert alert-danger">{error || localError}</p>
      )}
      {success && (
        <p
          style={{ color: "rgba(21, 83, 35, 1)" }}
          className="alert alert-success"
        >
          {success}
        </p>
      )}

      <form onSubmit={handleSubmit} className="form-group">
        {/* Ligne des pourcentages */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div
            style={{
              width: "100%",
            }}
          >
            <label htmlFor="startPercentage">
              Pourcentage de Début de Virement (%)
            </label>
            <input
              type="number"
              id="startPercentage"
              name="startPercentage"
              className="form-input"
              value={startPercentage}
              onChange={(e) => setStartPercentage(e.target.value)}
              min="0"
              max="100"
              step="any"
              required
              disabled={isSubmitting}
            />
          </div>

          <div
            style={{
              width: "100%",
            }}
          >
            <label htmlFor="stopPercentage" className="mt-3">
              Pourcentage d'Arrêt de Virement (%)
            </label>
            <input
              type="number"
              id="stopPercentage"
              name="stopPercentage"
              className="form-input"
              value={stopPercentage}
              onChange={(e) => setStopPercentage(e.target.value)}
              min="0"
              max="100"
              step="any"
              required
              disabled={isSubmitting}
            />
          </div>
        </div>

        {/* 🚀 NOUVEAU TEXTAREA POUR LE MESSAGE */}
        <div className="mb-3">
          <label htmlFor="stopMessage" className="form-label">
            Message à Afficher (Arrêt du Virement)
          </label>
          <textarea
            id="stopMessage"
            name="stopMessage"
            className="form-input"
            rows="3"
            value={stopMessage}
            onChange={(e) => setStopMessage(e.target.value)}
            required
            placeholder=""
            disabled={isSubmitting}
          />
        </div>

        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Mise à jour en cours..."
            : "Mettre à jour les pourcentages"}
        </button>
      </form>
    </div>
  );
};

export default PercentageStopForm;
