import React, { useEffect, useState, useContext } from "react";
import { CoinsContext } from "../context/CoinsContext";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from "firebase/firestore";
import "./AchatDeCompteFlashHistory.css";

// --- CONFIGURATION DES URLS ---
const URL_LOCAL = "http://localhost:3001";
const URL_VERCEL = "https://online-bank-app.vercel.app";

// ⬇️ C'est ici que tu choisis quel lien est utilisé dans l'historique ⬇️
const APP2_URL = URL_VERCEL;
// const APP2_URL = URL_LOCAL;

// --- MODALE DE DÉTAILS ---
const HistoryDetailModal = ({ item, onClose }) => {
  if (!item) return null;
  const { detailsCompte } = item;

  // Utilisation de l'URL configurée en haut
  const lienConnexion = `${APP2_URL}/?id=${detailsCompte.identifiant}`;

  return (
    <div className="internal-popup info">
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="popup-content">
        <div className="popup-icon info">i</div>
        <h4>Détails du Compte</h4>
        <p>Voici les informations récupérées pour cet achat.</p>

        <div className="popup-details">
          <div className="detail-section-title">Connexion Client</div>
          <div className="detail-row">
            <span className="detail-key">Lien:</span>
            <a
              href={lienConnexion}
              target="_blank"
              rel="noopener noreferrer"
              className="detail-link"
            >
              Ouvrir le lien
            </a>
          </div>
          <div className="detail-row">
            <span className="detail-key">Identifiant:</span>
            <span className="detail-value">
              {detailsCompte.identifiant || "N/A"}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Code PIN:</span>
            <span className="detail-value">
              {detailsCompte.codePin || "N/A"}
            </span>
          </div>

          <div className="detail-section-title" style={{ marginTop: "15px" }}>
            Finance
          </div>
          <div className="detail-row">
            <span className="detail-key">Solde:</span>
            <span className="detail-value">
              {detailsCompte.soldeCompte} {detailsCompte.devise}
            </span>
          </div>
          <div className="detail-row">
            <span className="detail-key">Frais Déblocage:</span>
            <span className="detail-value" style={{ color: "#f59e0b" }}>
              {detailsCompte.fraisDeblocage
                ? `${detailsCompte.fraisDeblocage} ${detailsCompte.devise}`
                : "0"}
            </span>
          </div>

          <div className="detail-section-title" style={{ marginTop: "15px" }}>
            Banque
          </div>
          <div className="detail-row">
            <span className="detail-key">Banque:</span>
            <span className="detail-value">{detailsCompte.banque}</span>
          </div>
          <div className="detail-row">
            <span className="detail-key">IBAN:</span>
            <span className="detail-value">{detailsCompte.iban}</span>
          </div>
        </div>
        <button onClick={onClose} className="popup-close-btn">
          Fermer
        </button>
      </div>
    </div>
  );
};

// --- COMPOSANT PRINCIPAL ---
const AchatDeCompteFlashHistory = () => {
  const { userUid } = useContext(CoinsContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState(null);

  // --- CORRECTION ICI : Utilisation de onSnapshot ---
  useEffect(() => {
    const currentUser = userUid || auth.currentUser?.uid;

    if (!currentUser) {
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, "purchasedAccounts"),
      where("creatorUid", "==", currentUser),
      orderBy("dateAchat", "desc")
    );

    // Écoute en temps réel
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const historyData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setHistory(historyData);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur historique:", error);
        setLoading(false);
      }
    );

    // Nettoyage de l'écouteur au démontage
    return () => unsubscribe();
  }, [userUid]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return new Intl.DateTimeFormat("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (loading)
    return <div className="history-loading">Chargement de l'historique...</div>;

  if (history.length === 0) {
    return (
      <div className="history-empty">
        <p>Aucun historique d'achat disponible.</p>
      </div>
    );
  }

  return (
    <div className="history-container">
      <HistoryDetailModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />

      <div className="history-header">
        <h3>Historique des Achats</h3>
        <span className="badge-count">{history.length}</span>
      </div>

      <div className="history-list">
        <div className="history-row header">
          <div className="col-date">Date</div>
          <div className="col-bank">Banque / Client</div>
          <div className="col-details">Accès</div>
          <div className="col-amount">Solde</div>
          <div className="col-status">Action</div>
        </div>

        {history.map((item) => (
          <div
            className="history-row item clickable"
            key={item.id}
            onClick={() => setSelectedItem(item)}
            style={{ cursor: "pointer" }}
          >
            <div className="col-date">
              <span className="mobile-label">Date:</span>
              {formatDate(item.dateAchat)}
            </div>
            <div className="col-bank">
              <div className="bank-name">{item.detailsCompte?.banque}</div>
              <div
                className="client-name"
                style={{ fontSize: "0.85rem", color: "#64748b" }}
              >
                {item.detailsCompte?.prenom} {item.detailsCompte?.nom}
              </div>
            </div>
            <div className="col-details">
              <span className="mobile-label">ID:</span>
              <div
                className="iban-small"
                style={{ background: "#e0f2fe", color: "#0369a1" }}
              >
                ID: {item.detailsCompte?.identifiant}
              </div>
            </div>
            <div className="col-amount">
              <span className="amount-value">
                {item.detailsCompte?.soldeCompte} {item.detailsCompte?.devise}
              </span>
              <span className="cost-sub">-{item.cout} coins</span>
            </div>
            <div className="col-status">
              <span
                className="status-badge success"
                style={{
                  background: "#0f172a",
                  color: "white",
                  border: "none",
                }}
              >
                VOIR
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AchatDeCompteFlashHistory;
