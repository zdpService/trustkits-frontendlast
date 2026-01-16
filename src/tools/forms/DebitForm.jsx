import React, { useState, useEffect } from "react";
import { Popover } from "bootstrap";

const DebitForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [amount, setAmount] = useState("");
  const [sendTo, setSendTo] = useState("");
  const [iban, setIban] = useState("");
  const [description, setDescription] = useState("");
  const [pastDate, setPastDate] = useState("");

  const currencySymbol = clientData?.devise || "€";

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );

    popoverTriggerList.forEach((popoverTriggerEl) => {
      try {
        new Popover(popoverTriggerEl);
      } catch (err) {
        console.warn("Popover initialization failed:", err);
      }
    });

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

    const parsedAmount = parseFloat(
      amount.replace(/\s/g, "").replace(",", ".")
    );

    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      alert("Veuillez entrer un montant valide supérieur à zéro.");
      return;
    }

    // Vérifier le solde disponible
    const currentBalance = clientData?.solde || 0;
    if (parsedAmount > currentBalance) {
      alert(
        `Solde insuffisant. Solde disponible: ${currentBalance} ${currencySymbol}`
      );
      return;
    }

    // ✅ Le montant est envoyé en POSITIF, la négation est gérée par le parent
    onSubmit({
      amount: parsedAmount,
      description: description || sendTo, // Utiliser description ou sendTo comme fallback
      sendTo,
      iban,
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
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="fc-debit">
        <div className="mb-3">
          <label htmlFor="fc-amount-debit" className="form-label">
            Montant du virement . <span style={{ color: "red" }}>requis</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">{currencySymbol}</span>
            <input
              type="text"
              className="form-control"
              id="fc-amount-debit"
              placeholder="Ex. 10000"
              name="fc-amount"
              required
              value={amount}
              onChange={(e) =>
                setAmount(e.target.value.replace(/[^\d\s.,]/g, ""))
              }
              style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
              maxLength="20"
              autoComplete="off"
              disabled={isSubmitting}
            />
          </div>
          <p
            className="text-muted"
            style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
          >
            Solde disponible: {clientData?.solde?.toLocaleString() || "0"}{" "}
            {currencySymbol}
          </p>
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
            placeholder="Ex. Jean Dupont"
            name="fc-send"
            required
            value={sendTo}
            onChange={(e) => setSendTo(e.target.value)}
            maxLength="50"
            style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            autoComplete="off"
            disabled={isSubmitting}
          />
        </div>

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
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="fc-iban" className="form-label">
            IBAN du bénéficiaire .{" "}
            <span style={{ color: "#53459a" }}>facultatif</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="fc-iban"
            placeholder="Ex. FR7630001007941234567890185"
            name="fc-iban"
            value={iban}
            onChange={(e) => setIban(e.target.value.toUpperCase())}
            minLength="10"
            maxLength="34"
            style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            autoComplete="off"
            disabled={isSubmitting}
          />
        </div>

        <div className="mb-3">
          <label htmlFor="fc-past-date-2" className="form-label">
            Date/heure de la transaction .{" "}
            <span style={{ color: "#53459a" }}>facultatif</span>
          </label>
          <input
            type="text"
            className="form-control fc-past-date-2"
            id="fc-past-date-2"
            placeholder="YYYY-MM-DD HH:MM (Ex: 2026-01-15 20:21)"
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
            data-bs-content="Format exact requis: YYYY-MM-DD HH:MM. Ex: 2026-01-15 20:21"
            data-bs-placement="top"
            aria-label="Date/Heure de la transaction"
            disabled={isSubmitting}
          />
          <small className="form-text text-muted">
            Si vide, la date actuelle sera utilisée
          </small>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            name="fc-debit"
            value="true"
            id="fc-debit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "En cours..." : "Approuver le virement sortant"}{" "}
            <i className="bi bi-arrow-right-short"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default DebitForm;
