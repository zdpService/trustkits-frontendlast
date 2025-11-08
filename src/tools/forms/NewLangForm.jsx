import React, { useState } from "react";

const NewLangForm = ({
  clientData,
  onSubmit,
  languages, // 👈 Tableau de chaînes de caractères (ex: ["Français", "Anglais"])
  isSubmitting,
  error,
  success,
}) => {
  // Utilise la langue actuelle du client pour l'initialisation
  const [selectedLanguage, setSelectedLanguage] = useState(
    clientData?.langueClient || ""
  );
  const [localError, setLocalError] = useState(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLocalError(null);

    if (!selectedLanguage) {
      setLocalError("Veuillez sélectionner une langue.");
      return;
    }

    // Le parent (FlashAccountUpdater) s'attend à 'language'
    onSubmit({
      language: selectedLanguage,
    });
  };

  return (
    <div className="action-form">
      {(error || localError) && (
        <p className="flash-message error">{error || localError}</p>
      )}
      {success && <p className="flash-message success">{success}</p>}

      <form onSubmit={handleSubmit} className="form-group">
        <input
          type="hidden"
          name="client-uid"
          value={clientData?.clientUid || ""}
        />
        <div className="mb-3">
          <label htmlFor="fc-lang" className="form-label">
            Langue d'affichage du compte
          </label>
          <select
            name="fc-lang"
            id="fc-lang"
            className="form-select"
            required
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>
              Langue parlée par le client
            </option>

            {/* 🎯 LOGIQUE DE RENDU CORRIGÉE POUR LE TABLEAU DE CHAÎNES (STRINGS) */}
            {Array.isArray(languages) && languages.length > 0 ? (
              languages.map((lang, index) => {
                // Ici, 'lang' est la chaîne de caractères (ex: "Français").
                // Nous l'utilisons pour la 'key', la 'value' et le 'label'.
                if (typeof lang === "string" && lang.trim() !== "") {
                  return (
                    <option
                      key={lang}
                      value={lang} // La valeur soumise sera la langue (ex: "Français")
                    >
                      {lang}
                    </option>
                  );
                }
                return null;
              })
            ) : (
              <option value="" disabled>
                Chargement ou aucune langue disponible.
              </option>
            )}
          </select>
          <p
            className="text-muted"
            style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
          >
            Langue actuelle du client : {clientData?.langueClient || "N/A"}
          </p>
        </div>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Définition en cours..."
              : "Définir la nouvelle langue"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewLangForm;
