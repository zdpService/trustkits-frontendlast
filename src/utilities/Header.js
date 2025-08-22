import "./Header.css";
import { Link, useNavigate } from "react-router-dom";
import image from "../utilities/images/téléchargement (2).png";
import { useState, useRef } from "react";
import MarqueeText from "./MarqueeText";
import LoginModal from "../admin/LoginModal";
import { useAdmin } from "../context/context"; // importer le context

const Header = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const navigate = useNavigate();
  const btnRef = useRef(null); // référence du bouton Connexion
  const { isAdmin } = useAdmin(); // récupérer l'état admin

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleConnexion = () => {
    setMenuOpen(false);
    if (window.innerWidth > 768) {
      setModalOpen(true); // grand écran : modal sous le bouton
    } else {
      navigate("/connexion"); // petit écran : redirection
    }
  };

  const scrollToSection = (id) => {
    const section = document.getElementById(id);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
      setMenuOpen(false); // fermer le menu mobile après clic
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column" }}>
      <header className="header">
        <div className="header-container">
          {/* Logo desktop */}
          <Link to="/" className="header-logo desktop-logo">
            <img src={image} alt="Logo" />
          </Link>

          {/* Burger menu */}
          <div className="burger-menu" onClick={toggleMenu}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12"
              />
            </svg>
          </div>

          {/* Navigation */}
          <nav className={`nav-links ${menuOpen ? "open" : ""}`}>
            <ul>
              <li>
                <Link onClick={toggleMenu} to={"/"}>
                  <span onClick={() => scrollToSection("apropos")}>
                    Accueil
                  </span>
                </Link>
              </li>
              <li>
                <span onClick={() => scrollToSection("apropos")}>A Propos</span>
              </li>
              <li>
                <span onClick={() => scrollToSection("actualites")}>
                  Actualités
                </span>
              </li>
              <li>
                <span onClick={() => scrollToSection("galerie")}>Galerie</span>
              </li>
              <li>
                <span onClick={() => scrollToSection("videos")}>Vidéos</span>
              </li>
              {/* <li>
                <span onClick={() => scrollToSection("activites")}>
                  Activités
                </span>
              </li>
              <li>
                <span onClick={() => scrollToSection("publications")}>
                  Publications
                </span>
              </li> */}
              <li>
                <span onClick={() => scrollToSection("contact")}>Contact</span>
              </li>
            </ul>

            {!isAdmin && (
              <button
                ref={btnRef}
                className="btn-connexion"
                onClick={() => handleConnexion()}
              >
                Connexion
              </button>
            )}

            <div className="mobile-logo">
              <img src={image} alt="Logo" />
            </div>
          </nav>
        </div>
      </header>

      {/* MarqueeText */}
      <div>
        <MarqueeText />
      </div>

      {/* Pop-up modal sous le bouton */}
      {!isAdmin && (
        <LoginModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          buttonRef={btnRef}
        />
      )}
    </div>
  );
};

export default Header;
