import "./HeaderHome.css";
import { Link, useNavigate } from "react-router-dom";
import {
  Bars3Icon,
  ArrowRightOnRectangleIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import imageLogo from "../pages/Capture d’écran 2025-09-27 135906.png";
import { useMenu } from "../context/MenuContext";
import { getAuth, signOut } from "firebase/auth";

const HeaderHome = () => {
  const { menuOpen, toggleMenu } = useMenu();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      navigate("/"); // Redirection après déconnexion
      window.location.reload(); // Forcer rechargement pour mise à jour UI
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
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
