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
  };

  return (
    <div className="action-form">
      {(error || localError) && (
        <p className="flash-message error">{error || localError}</p>
      )}
      {success && <p className="flash-message success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-group">
        <label htmlFor="newTransferCode" className="form-label">
          Nouveau Code d'Activation de Virement
        </label>
        <input
          type="text"
          id="newTransferCode"
          name="newTransferCode"
          className="form-input"
          value={newTransferCode}
          onChange={(e) => setNewTransferCode(e.target.value)}
          minLength="4"
          maxLength="10"
          required
          placeholder="Entrez le nouveau code (ex: 9876)"
          disabled={isSubmitting}
        />
        <p
          className="text-muted"
          style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
        >
          Code actuel du client:{" "}
          {clientData?.transferCode ? clientData.transferCode : "N/A"}
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
