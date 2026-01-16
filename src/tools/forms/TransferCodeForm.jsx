import React, { useState } from "react";

const TransferCodeForm = ({
  clientData,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => {
  const [newTransferCode, setNewTransferCode] = useState("");
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    if (
      !newTransferCode ||
      newTransferCode.length < 4 ||
      newTransferCode.length > 10
    ) {
      setLocalError(
        "Veuillez entrer un nouveau Code d'Activation de Virement valide (entre 4 et 10 caractères)."
      );
      return;
    }

    onSubmit({ newTransferCode: newTransferCode });

    // Réinitialiser après soumission
    setNewTransferCode("");
  };

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {(error || localError) && (
        <p className="alert alert-danger">{error || localError}</p>
      )}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-group">
        <label htmlFor="newTransferCode" className="form-label">
          Nouveau Code d'Activation de Virement
          <span style={{ color: "red" }}> (requis)</span>
        </label>
        <input
          type="text"
          id="newTransferCode"
          name="newTransferCode"
          className="form-control"
          value={newTransferCode}
          onChange={(e) =>
            setNewTransferCode(e.target.value.toUpperCase().slice(0, 10))
          }
          minLength="4"
          maxLength="10"
          required
          placeholder="Entrez le nouveau code (ex: 41I3G9)"
          disabled={isSubmitting}
        />
        <p
          className="text-muted"
          style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
        >
          Code actuel du client: {clientData?.codeActivationVirement || "N/A"}
        </p>

        <button
          type="submit"
          className="btn btn-primary mt-3"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Changement en cours..."
            : "Changer le Code d'Activation"}
        </button>
      </form>
    </div>
  );
};

export default TransferCodeForm;
