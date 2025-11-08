// forms/NewCurrencyForm.jsx
import React, { useState } from "react";

const NewCurrencyForm = ({ clientHash, onSubmit, currencies }) => {
  const [selectedCurrency, setSelectedCurrency] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedCurrency) {
      alert("Veuillez sélectionner une devise.");
      return;
    }
    onSubmit({
      actionType: "fc-new-currency",
      clientHash,
      currency: selectedCurrency,
    });
    setSelectedCurrency("");
  };

  return (
    <form onSubmit={handleSubmit} className="fc-new-currency">
      <input
        type="hidden"
        name="fc-link-hash"
        className="fc-link-hash"
        value={clientHash}
      />
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
      </div>
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-new-currency"
          value="true"
          id="fc-new-currency"
        >
          Changer la devise du compte{" "}
          <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default NewCurrencyForm;
