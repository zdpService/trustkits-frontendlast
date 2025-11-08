// forms/RefundForm.jsx
import React, { useState, useEffect } from "react";
import { Popover } from "bootstrap";

const RefundForm = ({ clientHash, onSubmit }) => {
  const [amount, setAmount] = useState("");
  const [receiver, setReceiver] = useState("");
  const [pastDate, setPastDate] = useState("");
  const [sendEmailAlert, setSendEmailAlert] = useState(false);

  useEffect(() => {
    const popoverTriggerList = document.querySelectorAll(
      '[data-bs-toggle="popover"]'
    );
    popoverTriggerList.forEach(
      (popoverTriggerEl) => new Popover(popoverTriggerEl)
    );
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      actionType: "fc-refund",
      clientHash,
      amount,
      receiver,
      pastDate,
      sendEmailAlert,
    });
    setAmount("");
    setReceiver("");
    setPastDate("");
    setSendEmailAlert(false);
  };

  return (
    <form onSubmit={handleSubmit} className="fc-refund">
      <input
        type="hidden"
        name="fc-link-hash"
        className="fc-link-hash"
        value={clientHash}
      />
      <div className="mb-3">
        <label htmlFor="fc-amount-refund" className="form-label">
          Montant du remboursement .{" "}
          <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="tel"
          className="form-control"
          id="fc-amount-refund"
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
        <label htmlFor="fc-receive-refund" className="form-label">
          Reçu de . <span style={{ color: "red" }}>requis</span>
        </label>
        <input
          type="text"
          className="form-control"
          id="fc-receive-refund"
          placeholder="Ex. VANTEX"
          name="fc-receive"
          required
          value={receiver}
          onChange={(e) => setReceiver(e.target.value)}
          maxLength="50"
          style={{ fontWeight: "bold", fontFamily: "'Cabin', sans-serif" }}
          autoComplete="off"
        />
      </div>
      <div className="mb-3">
        <label htmlFor="fc-past-date-3" className="form-label">
          Choisir une date dans le passé .{" "}
          <span style={{ color: "#53459a" }}>facultatif</span>
        </label>
        <input
          type="text"
          className="form-control fc-past-date-3"
          id="fc-past-date-3"
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
        />
        <label className="form-check-label" htmlFor="fc-refund-alert">
          Envoyer une notification par e-mail au client.
        </label>
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-refund"
          value="true"
          id="fc-refund"
        >
          Approuver le remboursement <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default RefundForm;
