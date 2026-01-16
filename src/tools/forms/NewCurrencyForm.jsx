import React, { useState } from "react";

const NewCurrencyForm = ({
  clientData,
  onSubmit,
  isSubmitting,
  error,
  success,
  currencies,
}) => {
  const [selectedCurrency, setSelectedCurrency] = useState(
    clientData?.devise || ""
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCurrency) {
      alert("Veuillez sélectionner une devise.");
      return;
    }
    onSubmit({
      currency: selectedCurrency,
    });
    // Ne pas réinitialiser après soumission pour garder la valeur sélectionnée
  };

  return (
    <div className="action-form" style={{ paddingTop: "1rem" }}>
      {error && <p className="alert alert-danger">{error}</p>}
      {success && <p className="alert alert-success">{success}</p>}

      <form onSubmit={handleSubmit} className="fc-new-currency">
        <div className="mb-3">
          <label htmlFor="fc-currency" className="form-label">
            Devise . <span style={{ color: "red" }}>requis</span>
          </label>
          <select
            name="fc-currency"
            id="fc-currency"
            className="form-select"
            required
            value={selectedCurrency}
            onChange={(e) => setSelectedCurrency(e.target.value)}
            disabled={isSubmitting}
          >
            <option value="" disabled>
              Devise disponible...
            </option>
            {currencies.map((group, index) => (
              <optgroup key={index} label={group.label}>
                {group.options.map((currency) => (
                  <option key={currency.value} value={currency.value}>
                    {currency.label}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <p
            className="text-muted"
            style={{ fontSize: "0.85rem", color: "#6c757d", marginTop: "5px" }}
          >
            Devise actuelle: {clientData?.devise || "N/A"}
          </p>
        </div>
        <div className="d-grid gap-2 d-md-flex justify-content-md-end">
          <button
            className="btn btn-primary"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting
              ? "Changement en cours..."
              : "Changer la devise du compte"}
            <i className="bi bi-arrow-right-short"></i>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewCurrencyForm;
