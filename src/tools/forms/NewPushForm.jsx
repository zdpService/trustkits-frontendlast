import React, { useState } from "react";

const NewPushForm = ({
  clientData,
  onSubmit,
  isSubmitting,
  error,
  success,
}) => {
  const [notificationMessage, setNotificationMessage] = useState(
    clientData?.notification || ""
  );
  const [sendEmailCopy, setSendEmailCopy] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();

    onSubmit({
      message: notificationMessage.trim(), // Si vide, supprimera la notification
      sendEmail: sendEmailCopy,
    });

    // Réinitialiser après soumission
    setNotificationMessage("");
    setSendEmailCopy(false);
  };

  const characterCount = notificationMessage.length;
  const maxLength = 500;

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="fc-new-push">
        <div className="mb-3">
          <div className="alert alert-info" role="alert">
            <div style={{ marginBottom: "4px" }}>
              <strong>ℹ️ Important :</strong>
              <ul style={{ marginBottom: 0, paddingLeft: "20px" }}>
                <li>
                  Si vous laissez le champ vide, toute notification existante
                  sera supprimée du compte client.
                </li>
                <li>
                  Si vous cochez "Envoyer par email", une copie sera envoyée à{" "}
                  <strong>{clientData?.email || "l'adresse du client"}</strong>.
                </li>
              </ul>
            </div>
          </div>

          <label htmlFor="fc-new-msg" className="form-label">
            Message de notification .{" "}
            <span style={{ color: "#53459a" }}>facultatif</span>
          </label>
          <textarea
            name="fc-new-msg"
            id="fc-new-msg"
            className="form-control"
            placeholder="Message affiché dans le compte client..."
            spellCheck="true"
            maxLength={maxLength}
            rows="4"
            value={notificationMessage}
            onChange={(e) => setNotificationMessage(e.target.value)}
            disabled={isSubmitting}
            style={{ fontFamily: "'Cabin', sans-serif" }}
          />
          <div
            className="form-text"
            style={{
              display: "flex",
              justifyContent: "space-between",
              marginTop: "5px",
            }}
          >
            <span>
              {clientData?.notification && (
                <>Notification actuelle : "{clientData.notification}"</>
              )}
            </span>
            <span
              style={{
                color: characterCount > maxLength * 0.9 ? "#dc3545" : "#6c757d",
              }}
            >
              {characterCount} / {maxLength}
            </span>
          </div>
        </div>

        <div className="form-check mb-3">
          <input
            className="form-check-input"
            type="checkbox"
            id="fc-send-email-copy"
            checked={sendEmailCopy}
            onChange={(e) => setSendEmailCopy(e.target.checked)}
            disabled={isSubmitting || !notificationMessage.trim()}
          />
          <label className="form-check-label" htmlFor="fc-send-email-copy">
            Envoyer une copie par email au client ({clientData?.email || "N/A"})
          </label>
        </div>

        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            name="fc-new-push"
            value="true"
            id="fc-new-push"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <span
                  className="spinner-border spinner-border-sm me-2"
                  role="status"
                  aria-hidden="true"
                ></span>
                Envoi en cours...
              </>
            ) : (
              <>
                {notificationMessage.trim()
                  ? "Envoyer la notification"
                  : "Supprimer la notification"}
                <i className="bi bi-arrow-right-short"></i>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewPushForm;
