import React, { useState } from "react";

const NewPinForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [newPin, setNewPin] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Vérification basique du format PIN (4 chiffres numériques)
    if (!/^\d{4}$/.test(newPin)) {
      setLocalError("Le code PIN doit être composé de 4 chiffres.");
      return;
    }

    // Appel de la fonction de soumission du parent,
    // en passant le nouveau PIN sous la clé 'pin'
    onSubmit({
      pin: newPin,
    });
  };

  return (
    <div className="action-form">
      <h4>Changer le code PIN de connexion</h4>

      {/* Affichage des messages flash (parent ou local) */}
      {(error || localError) && (
        <p className="flash-message error">{error || localError}</p>
      )}
      {success && <p className="flash-message success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="hidden"
          name="client-uid"
          value={clientData?.clientUid || ""}
        />
        <div className="mb-3">
          <label htmlFor="fc-pin" className="form-label">
            Nouveau code PIN (4 chiffres)
            <span style={{ color: "red" }}> (requis)</span>
          </label>
          <input
            type="number"
            id="fc-pin"
            name="fc-pin"
            className="form-control"
            placeholder="Ex: 1234"
            maxLength="4"
            required
            value={newPin}
            onChange={(e) => {
              // Limite la saisie à 4 chiffres
              const value = e.target.value.slice(0, 4);
              setNewPin(value);
            }}
            disabled={isSubmitting}
          />
          <p
            className="text-muted"
            style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
          >
            Ancien code PIN: {clientData?.codePin || "N/A"}
          </p>
        </div>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting || newPin.length !== 4}
          >
            {isSubmitting
              ? "Changement en cours..."
              : "Confirmer le nouveau PIN"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPinForm;
