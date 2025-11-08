// forms/DebitForm.jsx

import React, { useState, useEffect } from "react";
// Assurez-vous que Popover est importé correctement si vous utilisez Bootstrap 5
import { Popover } from "bootstrap";

const DebitForm = ({ clientHash, onSubmit, isSubmitting }) => {
  const [amount, setAmount] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [iban, setIban] = useState("");
  const [description, setDescription] = useState(""); // 🔑 NOUVEL ÉTAT
  const [pastDate, setPastDate] = useState("");

  useEffect(() => {
    // Initialisation des Popovers Bootstrap
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    popoverTriggerList.forEach(
      (popoverTriggerEl) => new Popover(popoverTriggerEl)
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Convertir l'entrée du montant en nombre flottant pour validation
    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Veuillez entrer un montant valide supérieur à zéro.");
      return;
    }

    // 🔑 Le Montant (amount) est envoyé en POSITIF. La négativation est faite par le parent.
    onSubmit({
      actionType: "fc-debit",
      clientHash,
      amount: parsedAmount, // Envoyer le montant parsé
      sendTo,
      iban,
      description, // 🔑 AJOUTÉ
      pastDate,
    });

    // Vider les champs après soumission
    setAmount("");
    setSendTo("");
    setIban("");
    setDescription("");
    setPastDate("");
  };

  return (
    <form onSubmit={handleSubmit} className="fc-debit">
      <input
        type="hidden"
        name="fc-link-hash"
        className="fc-link-hash"
        value={clientHash}
      />
      <div className="mb-3">
        <label htmlFor="fc-amount-debit" className="form-label">
          Montant du virement . <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="tel"
          className="form-control"
          id="fc-amount-debit"
          placeholder="Ex. 10000"
          name="fc-amount"
          required
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          maxLength="20"
          autoComplete="off"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="fc-send" className="form-label">
          Envoyé à (Nom du bénéficiaire) .{" "}
          <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="fc-send"
          placeholder="Ex. VANTEX"
          name="fc-send"
          required
          value={sendTo}
          onChange={(e) => setSendTo(e.target.value)}
          maxLength="50"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
        />
      </div>

      {/* 🔑 CHAMP : Description / Motif du virement */}
      <div className="mb-3">
        <label htmlFor="fc-description-debit" className="form-label">
          Description / Motif . <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="fc-description-debit"
          placeholder="Ex. Achat en ligne / Loyer de Février"
          name="fc-description"
          required
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          maxLength="100"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
        />
      </div>
      {/* FIN DU CHAMP */}

      <div className="mb-3">
        <label htmlFor="fc-iban" className="form-label">
          IBAN du Reçeveur .{" "}
          <span style={{ color: "#53459a" }}>facultatif</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="fc-iban"
          placeholder="Ex. LTXXXXXXXXXXXXXXXXXX"
          name="fc-iban"
          value={iban}
          onChange={(e) => setIban(e.target.value)}
          minLength="10"
          maxLength="100"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="fc-past-date-2" className="form-label">
          Choisir une date dans le passé .{" "}
          <span style={{ color: "#53459a" }}>facultatif</span>
        </label>
        <input
          type="text"
          className="form-control fc-past-date-2"
          id="fc-past-date-2"
          placeholder="YYYY-MM-DD HH:MM"
          pattern="^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$"
          name="fc-past-date"
          value={pastDate}
          onChange={(e) => setPastDate(e.target.value)}
          minLength="16"
          maxLength="16"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
          data-bs-toggle="popover"
          data-bs-trigger="focus"
          data-bs-content="La date doit respecter exactement ce format YYYY-MM-DD HH:MM pour être prise en compte. Exemple : 2024-02-14 11:08"
          data-bs-placement="top"
          data-bs-original-title="Date dans le passé"
          aria-label="Date dans le passé"
        />
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-debit"
          value="true"
          id="fc-debit"
          // Utilisation de la prop isSubmitting pour désactiver le bouton
          disabled={isSubmitting}
        >
          {isSubmitting ? "En cours..." : "Approuver le virement sortant"}{" "}
          <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default DebitForm;
