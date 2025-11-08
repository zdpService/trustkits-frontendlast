// src/utilities/HeaderHome.jsx

import React, { useContext } from "react"; // ⬅️ useContext ajouté
import "./HeaderHome.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import imageLogo from "../pages/Capture d’écran 2025-09-27 135906.png";
import { useMenu } from "../context/MenuContext";
import { CoinsContext } from "../context/CoinsContext"; // ⬅️ Import du contexte Coins

const HeaderHome = () => {
  const { menuOpen, toggleMenu } = useMenu();
  const navigate = useNavigate();
  // 🔑 Récupération de fullLogout du contexte
  const { fullLogout } = useContext(CoinsContext);

  // 🔑 Utilisation de la déconnexion centralisée
  const handleLogout = async () => {
    // Passer 'navigate' comme callback pour la redirection après nettoyage
    fullLogout(navigate);
    // Suppression du window.location.reload() redondant, car il est dans fullLogout
  };

  return (
    <header className="header">
      <Link to={"/"} className="header__logo">
        <img src={imageLogo} alt="Logo" />
      </Link>

      <div className="header__right">
        <button
          className="header__icon_button"
          onClick={handleLogout}
          title="Déconnexion"
        >
          <ArrowRightOnRectangleIcon className="header__icon" />
        </button>

        <button
          className="header__icon_button"
          onClick={toggleMenu}
          title={menuOpen ? "Fermer" : "Menu"}
        >
          {menuOpen ? (
            <XMarkIcon className="header__icon" />
          ) : (
            <Bars3Icon className="header__icon" />
          )}
        </button>
      </div>
    </header>
  );
};

export default HeaderHome;
