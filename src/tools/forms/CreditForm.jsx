import React, { useState, useEffect } from "react";
import { Popover } from "bootstrap";

const CreditForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [pastDate, setPastDate] = useState("");
  const [sendEmailAlert, setSendEmailAlert] = useState(false);

  // Utiliser clientData pour les informations du client
  const currencySymbol = clientData?.devise || "€";

  // Effet pour initialiser les popovers Bootstrap
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
    const cleanAmount = parseFloat(amount.replace(/\s/g, "").replace(",", "."));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }

    // ✅ Validation de l'email si la case est cochée
    if (sendEmailAlert && !clientData?.email) {
      alert(
        "⚠️ L'email du client est manquant. Impossible d'envoyer une notification par email."
      );
      return;
    }

    // Appel de la fonction onSubmit fournie par le parent (FlashAccountUpdater)
    onSubmit({
      amount: cleanAmount,
      description: receiver, // Nom de l'émetteur
      pastDate, // Format: YYYY-MM-DD HH:MM ou vide
      sendEmailAlert, // ✅ Transmet l'état de la checkbox
    });

    // Réinitialiser le formulaire après soumission
    setAmount("");
    setReceiver("");
    setPastDate("");
    setSendEmailAlert(false);
  };

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {/* Affichage des messages d'erreur et de succès transmis par le parent */}
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="fc-credit">
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
            Solde actuel: {clientData?.solde?.toLocaleString() || "0"}{" "}
            {currencySymbol}
          </p>
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
            placeholder="YYYY-MM-DD HH:MM (Ex: 2026-01-15 20:21)"
            name="fc-past-date"
            value={pastDate}
            onChange={(e) => setPastDate(e.target.value)}
            minLength="16"
            maxLength="16"
            pattern="^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$"
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

        {/* ✅ Checkbox pour envoyer une notification par email */}
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
            disabled={isSubmitting || !clientData?.email}
          />
          <label className="form-check-label" htmlFor="fc-credit-alert">
            📧 Envoyer une notification par e-mail au client
            {!clientData?.email && (
              <span
                style={{
                  color: "#dc3545",
                  fontSize: "0.85rem",
                  marginLeft: "8px",
                }}
              >
                (Email manquant)
              </span>
            )}
          </label>
          {sendEmailAlert && clientData?.email && (
            <small className="form-text text-success d-block mt-1">
              ✅ Un email sera envoyé à : {clientData.email}
            </small>
          )}
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
    </div>
  );
};

export default CreditForm;
