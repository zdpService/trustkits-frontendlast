// forms/CreditForm.jsx (Code COMPLET - Aucune modification nécessaire)

import React, { useState, useEffect } from "react";
import { Popover } from "bootstrap";

const CreditForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [pastDate, setPastDate] = useState(""); // Sera utilisé pour la date (passée ou future)
  const [sendEmailAlert, setSendEmailAlert] = useState(false);

  // Utiliser clientData pour les informations du client
  const currencySymbol = clientData?.devise || "€";

  // Effet pour initialiser les popovers Bootstrap
  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    // Assurez-vous que Popover est correctement importé et accessible
    popoverTriggerList.forEach(
      (popoverTriggerEl) => new Popover(popoverTriggerEl)
    );

    // Fonction de nettoyage pour détruire les popovers
    return () => {
      popoverTriggerList.forEach((popoverTriggerEl) => {
        const popover = Popover.getInstance(popoverTriggerEl);
        if (popover) {
          popover.dispose();
        }
      });
    };
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    // Validation simple pour s'assurer que le montant est numérique
    // Remplace les espaces et la virgule par un point pour un parse float correct
    const cleanAmount = parseFloat(amount.replace(/\s/g, "").replace(",", "."));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }

    // Appel de la fonction onSubmit fournie par le parent (FlashAccountUpdater)
    onSubmit({
      amount: cleanAmount,
      description: receiver, // 'description' est le nom du champ attendu par l'API (et utilisé comme 'sender' pour un crédit)
      pastDate, // Transmet la date telle quelle (vide ou au format YYYY-MM-DD HH:MM)
      sendEmailAlert,
    });

    // Réinitialiser le formulaire après soumission
    setAmount("");
    setReceiver("");
    setPastDate("");
    setSendEmailAlert(false);
  };

  return (
    <form onSubmit={handleSubmit} className="fc-credit">
      {/* Affichage des messages d'erreur et de succès transmis par le parent */}
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <div className="mb-3">
        <label htmlFor="fc-amount-credit" className="form-label">
          Montant du virement . <span style={{ color: "red" }}>requis</span>
        </label>
        <div className="input-group">
          <span className="input-group-text">{currencySymbol}</span>
          <input
            type="text"
            className="form-control"
            id="fc-amount-credit"
            placeholder="Ex. 10000"
            name="fc-amount"
            required
            value={amount}
            onChange={(e) =>
              // Filtre pour n'accepter que les chiffres, espaces, points et virgules
              setAmount(e.target.value.replace(/[^\d\s.,]/g, ""))
            }
            style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            maxLength="20"
            autoComplete="off"
            disabled={isSubmitting}
          />
        </div>
      </div>
      <div className="mb-3">
        <label htmlFor="fc-receive" className="form-label">
          Reçu de (Nom de l'émetteur) .{" "}
          <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="fc-receive"
          placeholder="Ex. VANTEX"
          name="fc-receive"
          required
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          maxLength="50"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
          disabled={isSubmitting}
        />
      </div>
      <div className="mb-3">
        <label htmlFor="fc-past-date-1" className="form-label">
          Date/heure de la transaction .{" "}
          <span style={{ color: "#53459a" }}>facultatif</span>
        </label>
        <input
          type="text"
          className="form-control fc-past-date-1"
          id="fc-past-date-1"
          placeholder="YYYY-MM-DD HH:MM (Ex: 2024-02-14 11:08)"
          name="fc-past-date"
          value={pastDate}
          onChange={(e) => setPastDate(e.target.value)}
          minLength="16"
          maxLength="16"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
          data-bs-toggle="popover"
          data-bs-trigger="focus"
          data-bs-placement="top"
          aria-label="Date/Heure de la transaction"
          disabled={isSubmitting}
        />
      </div>
      <div
        className="form-check form-switch"
        style={{ margin: "10px 0px 20px" }}
      >
        <input
          className="form-check-input"
          type="checkbox"
          role="switch"
          id="fc-credit-alert"
          name="fc-credit-alert"
          checked={sendEmailAlert}
          onChange={(e) => setSendEmailAlert(e.target.checked)}
          disabled={isSubmitting}
        />
        <label className="form-check-label" htmlFor="fc-credit-alert">
          Envoyer une notification par e-mail au client.
        </label>
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-credit"
          value="true"
          id="fc-credit"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "Approbation en cours..."
            : "Approuver le virement entrant"}
          <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default CreditForm;
