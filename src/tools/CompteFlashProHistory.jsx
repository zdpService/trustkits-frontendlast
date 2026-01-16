import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";
import ClientDetailModal from "./modal &details/ClientDetailModal";
import "./CompteFlashProHistory.css";
import Loading from "../utilities/laoding/Loading";

const FRONTEND_URL =
  process.env.REACT_APP_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vantex.ink"
    : "http://localhost:3001");

const baseClientAccessDetails = {
  hashLien: "N/A",
  lienRaccourci: "#",
  lienConnexion: `${FRONTEND_URL}/login`,
  email: "N/A",
  codePin: "N/A",
  iban: "N/A",
  nomPrenom: "N/A",
  telephone: "N/A",
  paysResidence: "N/A",
  adresseResidence: "N/A",
  langueClient: "N/A",
  couleurInterface: "N/A",
  soldeCompte: "0,00 €",
  notification: "N/A",
  pourcentageDepart: "0",
  pourcentageArret: "0",
  messageApresVirement: "N/A",
  stopMessage: "N/A",
  codeActivationUtilise: "NON",
  alertesEmail: "Désactivé",
  coutCreation: "10000 Crédits",
  dateCreation: "N/A",
  etat: "Inconnu",
  codeTransfert: "N/A",
};

const getStatusIcon = (status) => {
  const isActive = status === "Flash Compte actif";
  const color = isActive ? "green" : "red";

  if (isActive) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="status-icon active"
        style={{ height: "18px", width: "18px", color }}
      >
        <path
          fillRule="evenodd"
          d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.323 4.105-1.683-1.683a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
          clipRule="evenodd"
        />
      </svg>
    );
  } else {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="currentColor"
        className="status-icon blocked"
        style={{ height: "18px", width: "18px", color }}
      >
        <path
          fillRule="evenodd"
          d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25V6.75a3.75 3.75 0 1 0-7.5 0v3a.75.75 0 0 1-1.5 0v-3c0-3.725 3.025-6.75 6.75-6.75S19.5 3.025 19.5 6.75v3a.75.75 0 0 1-1.5 0Z"
          clipRule="evenodd"
        />
      </svg>
    );
  }
};

const CompteFlashProHistory = ({ newClientCreation, onModalClose }) => {
  const [clientAccesses, setClientAccesses] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [swipedItemId, setSwipedItemId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  useEffect(() => {
    if (newClientCreation) {
      setSelectedClient(newClientCreation.details);
    }
  }, [newClientCreation]);

  useEffect(() => {
    let unsubscribeSnapshot = null;

    const setupListener = async (currentUser) => {
      setLoading(true);
      setError(null);

      try {
        const clientAccessesRef = collection(db, "clientAccesses");

        const q = query(
          clientAccessesRef,
          where("creatorUid", "==", currentUser.uid)
        );

        unsubscribeSnapshot = onSnapshot(
          q,
          (snapshot) => {
            const fetchedAccesses = snapshot.docs.map((doc) => {
              const data = doc.data();
              const realClientUid = data.relatedClientUid || data.uid;

              let dateCreationFormatted = "N/A";
              if (data.dateCreation) {
                if (typeof data.dateCreation === "string") {
                  dateCreationFormatted = data.dateCreation;
                } else if (data.dateCreation.toDate) {
                  dateCreationFormatted = data.dateCreation
                    .toDate()
                    .toLocaleString("fr-FR", {
                      year: "numeric",
                      month: "2-digit",
                      day: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });
                }
              }

              const currencyCode =
                data.devise === "€" ? "EUR" : data.devise || "EUR";
              const currentSolde = data.solde !== undefined ? data.solde : 0;
              const soldeCompteFormatted = new Intl.NumberFormat("fr-FR", {
                style: "currency",
                currency: currencyCode,
              }).format(currentSolde);

              return {
                id: doc.id,
                realClientUid: realClientUid,
                lienConnexion: data.lienConnexion,
                dateCreation: dateCreationFormatted,
                etat:
                  data.etat === "Flash Compte actif"
                    ? "Flash Compte actif"
                    : "Flash Compte bloqué",
                etatCourt:
                  data.etat === "Flash Compte actif"
                    ? "Compte actif"
                    : "Compte bloqué",
                details: {
                  ...baseClientAccessDetails,
                  ...data,
                  nomPrenom:
                    `${data.prenom || ""} ${data.nom || ""}`.trim() || "N/A",
                  soldeCompte: soldeCompteFormatted,
                  adresseResidence: data.adresseResidence || "N/A",
                  dateCreation: dateCreationFormatted,
                  hashLien: data.hashLien || "N/A",
                  email: data.email || "N/A",
                  codePin: data.pinAccess || data.codePin || "N/A",
                  coutCreation: data.coutCreation || "10000 Crédits",
                },
              };
            });
            setClientAccesses(fetchedAccesses);
            setLoading(false);
          },
          (err) => {
            console.error("❌ Erreur Firestore:", err);
            if (err.message.includes("indexes")) {
              setError(
                "⚠️ Index manquant ! Ouvre la console (F12) et clique sur le lien Firebase."
              );
            } else {
              setError("Erreur de chargement.");
            }
            setLoading(false);
          }
        );
      } catch (err) {
        console.error("Erreur setup:", err);
        setLoading(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        setupListener(currentUser);
      } else {
        setClientAccesses([]);
        setLoading(false);
      }
    });

    return () => {
      if (unsubscribeSnapshot) unsubscribeSnapshot();
      unsubscribeAuth();
    };
  }, []);

  // --- HANDLERS ---
  const handleStart = (clientX, clientY) => {
    touchStartX.current = clientX;
    touchStartY.current = clientY;
  };

  const handleEnd = (clientX, clientY, itemId) => {
    const diffX = touchStartX.current - clientX;
    const diffY = Math.abs(touchStartY.current - clientY);
    if (diffX > 50 && diffY < 50) setSwipedItemId(itemId);
    else if (diffX < -50 && diffY < 50) setSwipedItemId(null);
  };

  const handleDeleteClient = async (historyDocId, realClientUid) => {
    if (
      !window.confirm(
        "Supprimer définitivement cet accès et le compte client associé ?"
      )
    )
      return;
    setDeleting(historyDocId);
    try {
      await deleteDoc(doc(db, "clientAccesses", historyDocId));
      if (realClientUid) {
        await deleteDoc(doc(db, "clients", realClientUid));
      }
      setSwipedItemId(null);
      setDeleting(null);
    } catch (err) {
      console.error("Erreur suppression:", err);
      alert("Erreur lors de la suppression.");
      setDeleting(null);
    }
  };

  const handleCardClick = (clientDetails) => {
    if (swipedItemId) {
      setSwipedItemId(null);
      return;
    }
    setSelectedClient(clientDetails);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    if (onModalClose) onModalClose(null);
  };

  const activeAccountsCount = clientAccesses.filter(
    (item) => item.etat === "Flash Compte actif"
  ).length;

  if (loading)
    return (
      <div className="virement-history-container">
        <Loading />
      </div>
    );
  if (error)
    return (
      <div
        className="virement-history-container"
        style={{ textAlign: "center", padding: "20px" }}
      >
        <p className="error-message" style={{ color: "red" }}>
          {error}
        </p>
      </div>
    );

  return (
    <div className="virement-history-container">
      <div className="header-section">
        <div className="header-title-container">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="header-icon"
            style={{ height: "24px", width: "24px" }}
          >
            <path
              fillRule="evenodd"
              d="M10.5 3.75a6 6 0 0 0-6 6v3.75c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.75a6 6 0 0 0-6-6Zm3.75 0a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5ZM7.5 3.75a.75.75 0 0 1 .75-.75h1.5a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-.75.75h-1.5a.75.75 0 0 1-.75-.75v-1.5ZM10.5 2.25a.75.75 0 0 0-1.5 0V3h1.5V2.25Z"
              clipRule="evenodd"
            />
            <path d="M12 18.75a.75.75 0 0 1 .75.75v1.5a.75.75 0 0 1-1.5 0v-1.5a.75.75 0 0 1 .75-.75Z" />
          </svg>
          <span className="header-title">
            Liste des accès ({activeAccountsCount})
          </span>
        </div>
      </div>

      <div className="client-list">
        {clientAccesses.length > 0 ? (
          clientAccesses.map((item) => (
            <div
              key={item.id}
              className="swipe-container"
              onTouchStart={(e) =>
                handleStart(e.touches[0].clientX, e.touches[0].clientY)
              }
              onTouchEnd={(e) =>
                handleEnd(
                  e.changedTouches[0].clientX,
                  e.changedTouches[0].clientY,
                  item.id
                )
              }
              onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
              onMouseUp={(e) => handleEnd(e.clientX, e.clientY, item.id)}
            >
              <div
                className={`client-list-item ${
                  swipedItemId === item.id ? "swiped" : ""
                } ${deleting === item.id ? "deleting" : ""}`}
                onClick={() => handleCardClick(item.details)}
              >
                <div className="client-info-summary">
                  <p className="client-name">{item.details.nomPrenom}</p>
                  <p className="client-date">{item.dateCreation}</p>
                </div>
                <div
                  className={`status-display status-${
                    item.etat === "Flash Compte actif" ? "actif" : "bloque"
                  }`}
                >
                  {getStatusIcon(item.etat)}
                  <span>{item.etatCourt}</span>
                </div>
              </div>
              {swipedItemId === item.id && (
                <button
                  className="delete-button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteClient(item.id, item.realClientUid);
                  }}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? "..." : "Supprimer"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-data-message">Aucun accès client trouvé.</p>
        )}
      </div>

      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CompteFlashProHistory;
