// src/components/AccountLayout.jsx

import React, { useEffect, useState, useContext } from "react";
import "./AccountLayout.css";
import { Link, useNavigate } from "react-router-dom";
import { useMenu } from "../context/MenuContext";
import HeaderHome from "../utilities/HeaderHome";
import {
  UserIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  TagIcon,
  UserGroupIcon,
  ArrowRightOnRectangleIcon,
} from "@heroicons/react/24/outline";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { CoinsContext } from "../context/CoinsContext"; // ⬅️ Import du contexte

const AccountLayout = ({ children }) => {
  const navigate = useNavigate();
  const { menuOpen, closeMenu } = useMenu();

  // 🔑 Utilisation des valeurs et de fullLogout du contexte
  const { coins, setCoins, fullLogout } = useContext(CoinsContext);
  const [userName, setUserName] = useState(null);
  const [isConnected, setIsConnected] = useState(false); // Cet état n'est pas utilisé, mais conservé

  const handleNavigate = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      closeMenu();
    }
  };

  // 🔑 Appel à la fonction centralisée de déconnexion
  const handleLogout = () => {
    // Passer 'navigate' comme callback pour la redirection après nettoyage
    fullLogout(navigate);
  };

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setIsConnected(true);
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          if (data.nom && data.prenom) {
            setUserName(`${data.nom} ${data.prenom.charAt(0).toUpperCase()}.`);
          } else {
            setUserName(user.email);
          }
          // NOTE: setCoins est géré par le Context, mais nous le laissons pour la mise à jour initiale du Layout
          // setCoins(data.coins || 150000);
        } else {
          setUserName(user.email);
          // setCoins(0);
        }
      } else {
        setIsConnected(false);
        setUserName(null);
        // setCoins(0);
      }
    });

    return () => unsubscribe();
  }, [setCoins]); // setCoins est inclus par précaution

  return (
    <div style={{ position: "relative" }}>
      <div className="header_fixed">
        <HeaderHome />
      </div>

      <div className="account_layout">
        {menuOpen && (
          <aside className="sidebar">
            <div className="sidebar_header">
              <h2>TrustKits</h2>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <p>
                  {coins} coin(s) {userName || "Invité"}
                </p>
                <span
                  style={{
                    alignContent: "flex-end",
                    paddingTop: "0.2rem",
                  }}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    style={{
                      height: "18px",
                      width: "18px",
                      marginRight: "8px",
                      color: "#94a3b8",
                      flexShrink: 0,
                    }}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12.75 11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 0 1-1.043 3.296 3.745 3.745 0 0 1-3.296 1.043A3.745 3.745 0 0 1 12 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 0 1-3.296-1.043 3.745 3.745 0 0 1-1.043-3.296A3.745 3.745 0 0 1 3 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 0 1 1.043-3.296 3.746 3.746 0 0 1 3.296-1.043A3.746 3.746 0 0 1 12 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 0 1 3.296 1.043 3.746 3.746 0 0 1 1.043 3.296A3.745 3.745 0 0 1 21 12Z"
                    />
                  </svg>
                </span>
              </div>
            </div>

            <nav className="sidebar_nav">
              <ul>
                <li onClick={() => handleNavigate("/account/?get=account")}>
                  <UserIcon className="sidebar-icon" /> Mon compte
                </li>
                <li onClick={() => handleNavigate("/account/?get=recharge")}>
                  <CreditCardIcon className="sidebar-icon" /> Recharge
                </li>
                <li onClick={() => handleNavigate("/account/?get=tools")}>
                  <Cog6ToothIcon className="sidebar-icon" /> Outils
                </li>
                <li onClick={() => handleNavigate("/account/?get=pricing")}>
                  <TagIcon className="sidebar-icon" /> Tarifs
                </li>
                <li onClick={() => handleNavigate("/account/?get=affiliation")}>
                  <UserGroupIcon className="sidebar-icon" /> Affiliation
                </li>
                <li onClick={handleLogout}>
                  <ArrowRightOnRectangleIcon className="sidebar-icon" />{" "}
                  Déconnexion
                </li>
              </ul>
            </nav>
          </aside>
        )}

        <main className="account_content">{children}</main>
      </div>
    </div>
  );
};

export default AccountLayout;
