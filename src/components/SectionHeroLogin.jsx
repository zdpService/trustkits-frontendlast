import "./SectionHeroLogin.css";
import heroImage from "../pages/toolbox-removebg-preview.png";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useState, useEffect } from "react";

const SectionHeroLogin = () => {
  const navigate = useNavigate();
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsConnected(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleClick = () => {
    if (isConnected) {
      navigate("/account");
    } else {
      navigate("/login");
    }
  };

  return (
    <section className="section_hero">
      <div className="section_hero__content">
        <h1>Votre boîte à outils professionnelle</h1>
        <p>
          <h3 style={{ opacity: "0.9", padding: "0.5rem 0" }}>
            Tous vos outils pro sur une seule plateforme.
          </h3>{" "}
          Vous êtes un particulier ou une entreprise dans la recherche d'outils
          professionnels pour croître votre visibilité, communiquer avec vos
          clients en confiance à travers plusieurs outils marketing fiables,
          acheter des numéros et cartes virtuelles, lancer des campagnes
          publicitaires pour augmenter votre audience à l'international et plus
          encore.
        </p>
        <p>
          Trust Kits est une solution complète tout en un spécialement conçu
          pour vous quel que soit votre secteur d'activité.
        </p>
        <div style={{ display: "flex", justifyContent: "start" }}>
          <button className="hero_btn" onClick={handleClick}>
            <span style={{ fontWeight: "bold", paddingBottom: "0.2rem" }}>
              Découvrir
            </span>
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ height: "24px", width: "24px" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M17.25 8.25 21 12m0 0-3.75 3.75M21 12H3"
                />
              </svg>
            </span>
          </button>
        </div>
      </div>
      <div className="section_hero__image">
        <img src={heroImage} alt="Hero" />
      </div>
    </section>
  );
};

export default SectionHeroLogin;
