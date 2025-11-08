import React from "react";
import "./VirementLoading.css";
import logo from "../../pages/Capture d’écran 2025-09-27 135702.png";

const VirementLoading = () => {
  return (
    <div className="loading_container">
      <div className="loading_box">
        <div className="loading_box__img">
          <img src={logo} alt="Logo" className="loading_logo" />
        </div>
        <div className="loading_spinner"></div>
        <p className="loading_text">Chargement du virement...</p>
      </div>
    </div>
  );
};

export default VirementLoading;
