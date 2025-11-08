// forms/NewPushForm.jsx
import React, { useState } from "react";

const NewPushForm = ({ clientHash, onSubmit }) => {
  const [notificationMessage, setNotificationMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      actionType: "fc-new-push",
      clientHash,
      notificationMessage,
    });
    setNotificationMessage("");
  };

  return (
    <form onSubmit={handleSubmit} className="fc-new-push">
      <input
        type="hidden"
        name="fc-link-hash"
        className="fc-link-hash"
        value={clientHash}
      />
      <div className="mb-3">
        <div className="alert alert-info" role="alert" id="showInfo">
          <div style={{ marginBottom: "4px" }}>
            Si vous cliquez sur le bouton "Envoyer la notification" sans rien
            saisir dans le champ "Notification affichée", toute notification
            existante sera supprimée du compte client.
            <br />
            <b>NB : </b>Si une notification est saisie, une copie de celle-ci
            sera envoyée à l'adresse e-mail du client en tant que message
            important à lire.
          </div>
        </div>
        <label htmlFor="fc-new-msg" className="form-label">
          Notification affichée en français .{" "}
          <i style={{ color: "#53459a" }}>facultatif</i>
        </label>
        <textarea
          name="fc-new-msg"
          id="fc-new-msg"
          className="form-control"
          placeholder="Notification affichée dans le compte..."
          spellCheck="false"
          maxLength="500"
          value={notificationMessage}
          onChange={(e) => setNotificationMessage(e.target.value)}
        ></textarea>
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-new-push"
          value="true"
          id="fc-new-push"
        >
          Envoyer la notification <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default NewPushForm;
