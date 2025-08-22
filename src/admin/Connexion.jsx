import React from "react";
import "./Connexion.css"; // tu peux réutiliser le CSS du modal en l'adaptant
import LoginForm from "../admin/LoginForm"; // extrait juste le formulaire du modal

const Connexion = () => {
  return (
    <div className="connexion-page">
      <h2>Connexion</h2>
      <LoginForm />
    </div>
  );
};

export default Connexion;
