// forms/BankColorForm.jsx
import React, { useState } from "react";

const colors = [
  "#0d6eba",
  "#6f42c1",
  "#fd7e14",
  "#ffc107",
  "#d63384",
  "#0dcaf0",
  "#495057",
  "#6610f2",
];

const BankColorForm = ({ clientHash, onSubmit }) => {
  const [selectedColor, setSelectedColor] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedColor) {
      alert("Veuillez choisir une couleur.");
      return;
    }
    onSubmit({
      actionType: "fc-bank-color",
      clientHash,
      color: selectedColor,
    });
    setSelectedColor("");
  };

  return (
    <form onSubmit={handleSubmit} className="fc-bank-color">
      <input
        type="hidden"
        name="fc-link-hash"
        className="fc-link-hash"
        value={clientHash}
      />
      <div className="mb-3">
        <label htmlFor="fc-lang" className="form-label">
          Choisissez une couleur . <span style={{ color: "red" }}>requis</span>
        </label>
        <div className="color-picker">
          {colors.map((color) => (
            <div
              key={color}
              className={`color-option ${
                selectedColor === color ? "selected" : ""
              }`}
              data-color={color}
              style={{ backgroundColor: color }}
              onClick={() => setSelectedColor(color)}
            ></div>
          ))}
        </div>
      </div>
      <input
        type="hidden"
        name="bk-color"
        id="selectedColor"
        value={selectedColor}
        required
      />
      <div className="d-grid gap-2 d-md-flex justify-content-md-end">
        <button
          className="btn btn-primary"
          type="submit"
          name="fc-bank-color"
          value="true"
          id="fc-bank-color"
        >
          Changer la couleur <i className="bi bi-arrow-right-short"></i>
        </button>
      </div>
    </form>
  );
};

export default BankColorForm;
