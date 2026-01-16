import React, { useState } from "react";

const NewPinForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [newPin, setNewPin] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    // Vérification basique du format PIN (6 chiffres numériques)
    if (!/^\d{6}$/.test(newPin)) {
      setLocalError("Le code PIN doit être composé de 6 chiffres.");
      return;
    }

    // Appel de la fonction de soumission du parent
    onSubmit({
      pin: newPin,
    });

    // Réinitialiser après soumission
    setNewPin("");
  };

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {/* Affichage des messages flash (parent ou local) */}
      {(error || localError) && (
        <p className="alert alert-danger">{error || localError}</p>
      )}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-group">
        <div className="mb-3">
          <label htmlFor="fc-pin" className="form-label">
            Nouveau code PIN (6 chiffres)
            <span style={{ color: "red" }}> (requis)</span>
          </label>
          <input
            type="text"
            id="fc-pin"
            name="fc-pin"
            className="form-control"
            placeholder="Ex: 543054"
            maxLength="6"
            required
            value={newPin}
            onChange={(e) => {
              // Limite la saisie à 6 chiffres uniquement
              const value = e.target.value.replace(/\D/g, "").slice(0, 6);
              setNewPin(value);
            }}
            disabled={isSubmitting}
          />
          <p
            className="text-muted"
            style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
          >
            Ancien code PIN: {clientData?.pinAccess || "N/A"}
          </p>
        </div>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting || newPin.length !== 6}
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
