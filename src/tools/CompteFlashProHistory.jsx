import React, { useState, useEffect, useRef } from "react";
import { db, auth } from "../firebase/config";
import {
  collection,
  query,
  where,
  onSnapshot,
  orderBy,
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
  const color = status === "Flash Compte actif" ? "green" : "red";

  const checkmarkIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="status-icon active"
      style={{ height: "18px", width: "18px", color: color }}
    >
      <path
        fillRule="evenodd"
        d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12Zm13.36-1.814a.75.75 0 1 0-1.22-.872l-3.323 4.105-1.683-1.683a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
        clipRule="evenodd"
      />
    </svg>
  );

  const lockIcon = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="status-icon blocked"
      style={{ height: "18px", width: "18px", color: color }}
    >
      <path
        fillRule="evenodd"
        d="M12 1.5a5.25 5.25 0 0 0-5.25 5.25v3a3 3 0 0 0-3 3v6.75a3 3 0 0 0 3 3h10.5a3 3 0 0 0 3-3v-6.75a3 3 0 0 0-3-3v-3c0-2.9-2.35-5.25-5.25-5.25Zm3.75 8.25V6.75a3.75 3.75 0 1 0-7.5 0v3a.75.75 0 0 1-1.5 0v-3c0-3.725 3.025-6.75 6.75-6.75S19.5 3.025 19.5 6.75v3a.75.75 0 0 1-1.5 0Z"
        clipRule="evenodd"
      />
    </svg>
  );

  if (status === "Flash Compte actif") {
    return checkmarkIcon;
  } else if (status === "Flash Compte bloqué") {
    return lockIcon;
  }
  return null;
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
    const fetchClientAccesses = async (currentUser) => {
      if (!currentUser) {
        setClientAccesses([]);
        setLoading(false);
        setError("Vous devez être connecté pour voir l'historique.");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const clientAccessesRef = collection(db, "clientAccesses");
        const q = query(
          clientAccessesRef,
          where("creatorUid", "==", currentUser.uid),
          orderBy("dateCreation", "desc")
        );

        const unsubscribe = onSnapshot(
          q,
          (snapshot) => {
            const fetchedAccesses = snapshot.docs.map((doc) => {
              const data = doc.data();
              const clientUid = doc.id;

              const baseClientLink = `${FRONTEND_URL}/login`;
              const hashLien = data.hashLien || btoa(clientUid).slice(0, 8);
              const lienRaccourci =
                data.lienRaccourci || `${FRONTEND_URL}/${hashLien}`;
              const lienConnexion = data.lienConnexion || baseClientLink;

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
                      timeZoneName: "short",
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

              const finalPourcentageDepart =
                data.pourcentageDepart !== undefined &&
                data.pourcentageDepart !== null
                  ? data.pourcentageDepart
                  : data.percentageStart || "0";

              const finalPourcentageArret =
                data.pourcentageArret !== undefined &&
                data.pourcentageArret !== null
                  ? data.pourcentageArret
                  : data.percentageStop || "0";

              const finalNotification = data.notification || "N/A";
              const finalAdresseResidence = data.adresseResidence || "N/A";

              const etatCourt =
                data.etat === "Flash Compte actif"
                  ? "Compte actif"
                  : data.etat === "Flash Compte bloqué"
                  ? "Compte bloqué"
                  : "Inconnu";

              return {
                id: clientUid,
                lienConnexion: lienConnexion,
                dateCreation: dateCreationFormatted,
                etat:
                  data.etat === "Flash Compte actif"
                    ? "Flash Compte actif"
                    : "Flash Compte bloqué",
                etatCourt: etatCourt,
                details: {
                  ...baseClientAccessDetails,
                  hashLien: hashLien,
                  lienRaccourci: lienRaccourci,
                  lienConnexion: lienConnexion,
                  email: data.email || "N/A",
                  codePin: data.codePin || "N/A",
                  iban: data.iban || "N/A",
                  nomPrenom:
                    `${data.prenom || ""} ${data.nom || ""}`.trim() || "N/A",
                  telephone: data.telephone || "N/A",
                  paysResidence: data.paysResidence || "N/A",
                  adresseResidence: finalAdresseResidence,
                  langueClient: data.langueClient || "N/A",
                  couleurInterface: data.couleurInterface || "N/A",
                  soldeCompte: soldeCompteFormatted,
                  messageApresVirement: data.messageApresVirement || "N/A",
                  stopMessage: data.stopMessage || "N/A",
                  alertesEmail: data.alertesEmail || "Désactivé",
                  dateCreation: dateCreationFormatted,
                  etat:
                    data.etat === "Flash Compte actif"
                      ? "Flash Compte actif"
                      : "Flash Compte bloqué",
                  pourcentageDepart: finalPourcentageDepart,
                  pourcentageArret: finalPourcentageArret,
                  notification: finalNotification,
                  codeActivationVirement: data.codeActivationVirement || "N/A",
                  codeTransfert: data.codeTransfert || "N/A",
                  codeActivationUtilise: data.codeActivationUtilise || "NON",
                  coutCreation: data.coutCreation || "10000 Crédits",
                },
              };
            });
            setClientAccesses(fetchedAccesses);
            setLoading(false);
          },
          (err) => {
            console.error("Error fetching client accesses:", err);
            setError("Erreur lors du chargement des accès clients.");
            setLoading(false);
          }
        );

        return unsubscribe;
      } catch (err) {
        console.error("Error setting up client access listener:", err);
        setError(
          "Erreur lors de la configuration de l'écoute des accès clients."
        );
        setLoading(false);
      }
    };

    const unsubscribeAuth = auth.onAuthStateChanged((currentUser) => {
      if (currentUser) {
        fetchClientAccesses(currentUser);
      } else {
        setClientAccesses([]);
        setLoading(false);
        setError("Vous devez être connecté pour voir l'historique.");
      }
    });

    return () => {
      unsubscribeAuth();
    };
  }, []);

  // ✅ Gestion du swipe vers la gauche
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  };

  const handleTouchEnd = (e, itemId) => {
    const touchEndX = e.changedTouches[0].clientX;
    const touchEndY = e.changedTouches[0].clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = Math.abs(touchStartY.current - touchEndY);

    // Swipe vers la gauche si: déplacement X > 50px et Y < 50px
    if (diffX > 50 && diffY < 50) {
      setSwipedItemId(itemId);
    }
  };

  // ✅ Gestion du swipe souris (drag vers la gauche)
  const handleMouseDown = (e) => {
    touchStartX.current = e.clientX;
    touchStartY.current = e.clientY;
  };

  const handleMouseUp = (e, itemId) => {
    const touchEndX = e.clientX;
    const touchEndY = e.clientY;

    const diffX = touchStartX.current - touchEndX;
    const diffY = Math.abs(touchStartY.current - touchEndY);

    if (diffX > 50 && diffY < 50) {
      setSwipedItemId(itemId);
    }
  };

  // ✅ Supprimer un accès client
  const handleDeleteClient = async (itemId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cet accès ?")) {
      return;
    }

    setDeleting(itemId);

    try {
      await deleteDoc(doc(db, "clientAccesses", itemId));
      setSwipedItemId(null);
      setDeleting(null);
      console.log("✅ Accès client supprimé avec succès");
    } catch (err) {
      console.error("❌ Erreur lors de la suppression:", err);
      alert("Erreur lors de la suppression de l'accès client.");
      setDeleting(null);
    }
  };

  const handleCardClick = (clientDetails) => {
    // Ne pas ouvrir le modal si on est en train de swiper
    if (swipedItemId) return;
    setSelectedClient(clientDetails);
  };

  const handleCloseModal = () => {
    setSelectedClient(null);
    if (onModalClose) {
      onModalClose(null);
    }
  };

  const activeAccountsCount = clientAccesses.filter(
    (item) => item.etat === "Flash Compte actif"
  ).length;

  if (loading) {
    return (
      <div className="virement-history-container">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="virement-history-container">
        <p className="error-message">{error}</p>
      </div>
    );
  }

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
            Liste des accès compte flash pro ({activeAccountsCount})
          </span>
        </div>
      </div>

      <div className="client-list">
        {clientAccesses.length > 0 ? (
          clientAccesses.map((item) => (
            <div
              key={item.id}
              className="swipe-container"
              onTouchStart={handleTouchStart}
              onTouchEnd={(e) => handleTouchEnd(e, item.id)}
              onMouseDown={handleMouseDown}
              onMouseUp={(e) => handleMouseUp(e, item.id)}
            >
              <div
                className={`client-list-item ${
                  swipedItemId === item.id ? "swiped" : ""
                } ${deleting === item.id ? "deleting" : ""}`}
                onClick={() => handleCardClick(item.details)}
              >
                <div className="client-info-summary">
                  <p>{item.details.nomPrenom || "N/A"}</p>
                  <p>{item.dateCreation}</p>
                </div>

                <div
                  className={`status-display status-${item.etat
                    .toLowerCase()
                    .replace(/\s/g, "-")}`}
                >
                  {getStatusIcon(item.etat)}
                  <span>{item.etatCourt}</span>
                </div>
              </div>

              {/* ✅ Bouton de suppression qui apparaît après swipe */}
              {swipedItemId === item.id && (
                <button
                  className="delete-button"
                  onClick={() => handleDeleteClient(item.id)}
                  disabled={deleting === item.id}
                >
                  {deleting === item.id ? "Suppression..." : "Supprimer"}
                </button>
              )}
            </div>
          ))
        ) : (
          <p className="no-data-message">
            Aucun accès client trouvé. Créez-en un dans l'onglet "Compte Flash
            Pro".
          </p>
        )}
      </div>

      {selectedClient && (
        <ClientDetailModal client={selectedClient} onClose={handleCloseModal} />
      )}
    </div>
  );
};

export default CompteFlashProHistory;
