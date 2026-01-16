import React, { useState, useEffect } from "react";
import { Popover } from "bootstrap";

const RefundForm = ({ clientData, onSubmit, isSubmitting, error, success }) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [pastDate, setPastDate] = useState("");
  const [sendEmailAlert, setSendEmailAlert] = useState(false);

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

    if (isSubmitting) return;

    const cleanAmount = parseFloat(amount.replace(/\s/g, "").replace(",", "."));

    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      alert("Veuillez entrer un montant valide.");
      return;
    }

    onSubmit({
      amount: cleanAmount,
      description: receiver, // Nom de l'émetteur du remboursement
      pastDate,
      sendEmailAlert,
    });

    // Réinitialiser le formulaire
    setAmount("");
    setReceiver("");
    setPastDate("");
    setSendEmailAlert(false);
  };

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <div
        className="alert alert-info"
        role="alert"
        style={{ marginBottom: "1rem" }}
      >
        <strong>ℹ️ À propos des remboursements :</strong>
        <p style={{ marginBottom: 0, marginTop: "8px" }}>
          Un remboursement ajoute des fonds au compte du client, comme un
          crédit. Utilisez cette option pour annuler un prélèvement ou compenser
          une erreur.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="fc-refund">
        <div className="mb-3">
          <label htmlFor="fc-amount-refund" className="form-label">
            Montant du remboursement .{" "}
            <span style={{ color: "red" }}>requis</span>
          </label>
          <div className="input-group">
            <span className="input-group-text">{currencySymbol}</span>
            <input
              type="text"
              className="form-control"
              id="fc-amount-refund"
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
          <label htmlFor="fc-receive-refund" className="form-label">
            Remboursé par (Source du remboursement) .{" "}
            <span style={{ color: "red" }}>requis</span>
          </label>
          <input
            type="text"
            className="form-control"
            id="fc-receive-refund"
            placeholder="Ex. VANTEX / Service Client"
            name="fc-receive"
            required
            value={receiver}
            onChange={(e) => setReceiver(e.target.value)}
            maxLength="50"
            style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
            autoComplete="off"
            disabled={isSubmitting}
          />
          <small className="form-text text-muted">
            Nom de l'entité qui effectue le remboursement
          </small>
        </div>

        <div className="mb-3">
          <label htmlFor="fc-past-date-3" className="form-label">
            Date/heure du remboursement .{" "}
            <span style={{ color: "#53459a" }}>facultatif</span>
          </label>
          <input
            type="text"
            className="form-control fc-past-date-3"
            id="fc-past-date-3"
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
            aria-label="Date/Heure du remboursement"
            disabled={isSubmitting}
          />
          <small className="form-text text-muted">
            Si vide, la date actuelle sera utilisée
          </small>
        </div>

        <div
          className="form-check form-switch"
          style={{ margin: "10px 0px 20px" }}
        >
          <input
            className="form-check-input"
            type="checkbox"
            role="switch"
            id="fc-refund-alert"
            name="fc-refund-alert"
            checked={sendEmailAlert}
            onChange={(e) => setSendEmailAlert(e.target.checked)}
            disabled={isSubmitting}
          />
          <label className="form-check-label" htmlFor="fc-refund-alert">
            Envoyer une notification par e-mail au client (
            {clientData?.email || "N/A"})
          </label>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-success"
            type="submit"
            name="fc-refund"
            value="true"
            id="fc-refund"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Traitement en cours...
              </>
            ) : (
              <>
                Approuver le remboursement
                <i className="bi bi-arrow-right-short"></i>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RefundForm;
