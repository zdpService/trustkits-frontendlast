import "./HeaderLogin.css";
import { Link, useNavigate } from "react-router-dom";
import {
  UserPlusIcon,
  ArrowRightOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import imageLogo from "../pages/Capture d’écran 2025-09-27 135906.png";
import PrimaryBtn from "../btn/PrimaryBtn";
import SecondaryBtn from "../btn/SecondaryBtn";
import { useState, useEffect } from "react";
import { getAuth, onAuthStateChanged, signOut } from "firebase/auth";
import Loading from "../utilities/laoding/Loading";

const HeaderLogin = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  // État pour gérer le chargement initial de la vérification Firebase
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsConnected(!!user);
      setIsLoading(false); // Marquer le chargement comme terminé
    });
    return () => unsubscribe();
  }, []);

  // La fonction handleLogout est conservée, mais n'est plus liée à un bouton
  const handleLogout = async () => {
    const auth = getAuth();
    try {
      await signOut(auth);
      setIsConnected(false);
      navigate("/"); // redirection vers accueil après déconnexion
      window.location.reload(); // pour forcer la mise à jour UI
    } catch (error) {
      console.error("Erreur lors de la déconnexion :", error);
    }
  };

  // Afficher le loader pendant la vérification Firebase
  if (isLoading) {
    return <Loading message="Vérification de la session..." />;
  }

  return (
    <header className="header">
      <Link to={"/"} className="header__logo">
        <img src={imageLogo} alt="Logo" />
      </Link>

      <div className="header__right">
        {!isConnected ? (
          /* Menu pour les utilisateurs DÉCONNECTÉS (S'inscrire / Connexion) */
          <ul className="header__menu">
            <li>
              <PrimaryBtn to="/login?mode=inscription">
                <UserPlusIcon className="header__icon" />
                S'inscrire
              </PrimaryBtn>
            </li>
            <li>
              <SecondaryBtn to="/login?mode=connexion">
                <ArrowRightOnRectangleIcon className="header__icon" />
                Connexion
              </SecondaryBtn>
            </li>
          </ul>
        ) : (
          /* Menu pour les utilisateurs CONNECTÉS (Uniquement Tableau de bord) */
          <ul className="header__menu">
            <li>
              <SecondaryBtn to="/account">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="header__icon"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                Tableau de bord
              </SecondaryBtn>
            </li>
            {/* Le bouton de déconnexion a été retiré ici */}
          </ul>
        )}

        <button
          className="header__toggle"
          aria-label="Menu"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? (
            <XMarkIcon className="header__icon--menu" />
          ) : (
            <Bars3Icon className="header__icon--menu" />
          )}
        </button>
      </div>

      {menuOpen && (
        <div className="header__mobile">
          {!isConnected ? (
            <>
              <PrimaryBtn to="/login?mode=inscription">
                <UserPlusIcon className="header__icon" />
                S'inscrire
              </PrimaryBtn>
              <SecondaryBtn to="/login?mode=connexion">
                <ArrowRightOnRectangleIcon className="header__icon" />
                Connexion
              </SecondaryBtn>
            </>
          ) : (
            <>
              <SecondaryBtn to="/account">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                  />
                </svg>
                Tableau de bord
              </SecondaryBtn>
              {/* Le bouton de déconnexion a été retiré ici */}
            </>
          )}
        </div>
      )}
    </header>
  );
};

export default HeaderLogin;
