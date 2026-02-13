import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
  getDocs,    // 👈 Nouvel import
  deleteDoc,  // 👈 Nouvel import
  doc         // 👈 Nouvel import
} from "firebase/firestore";
import { db } from "../firebase/config";
import "./SmsSenderFormHistory.css";

const SmsSenderFormHistory = () => {
  const [messages, setMessages] = useState([]);
  const [selectedSms, setSelectedSms] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false); // État pour le chargement suppression

  useEffect(() => {
    // Requête Firebase avec limite de 50 messages
    const q = query(
      collection(db, "sms_history"),
      orderBy("createdAt", "desc"),
      limit(50),
    );

    // Écoute en temps réel
    const unsubscribe = onSnapshot(
      q,
      (querySnapshot) => {
        const docs = [];
        querySnapshot.forEach((doc) => {
          docs.push({ id: doc.id, ...doc.data() });
        });
        setMessages(docs);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur Firebase:", error);
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, []);

  // 🗑️ Fonction pour tout supprimer
  const handleDeleteAll = async () => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer TOUT l'historique ? Cette action est irréversible.")) {
      return;
    }

    setIsDeleting(true);
    try {
      // 1. Récupérer tous les documents de l'historique
      const querySnapshot = await getDocs(collection(db, "sms_history"));
      
      // 2. Créer une liste de promesses de suppression
      const deletePromises = querySnapshot.docs.map((document) => 
        deleteDoc(doc(db, "sms_history", document.id))
      );

      // 3. Exécuter toutes les suppressions
      await Promise.all(deletePromises);
      
      // Pas besoin de mettre à jour 'messages' manuellement car onSnapshot le fera
    } catch (error) {
      console.error("Erreur lors de la suppression :", error);
      alert("Une erreur est survenue lors de la suppression.");
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "En attente...";

    try {
      const date = timestamp.toDate();
      return date.toLocaleString("fr-FR", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch (error) {
      return "Date invalide";
    }
  };

  return (
    <div className="sms-history-mini-container">
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "15px"
      }}>
        <h2 style={{ margin: 0 }}>Historique ({messages.length})</h2>
        
        {/* BOUTON SUPPRIMER TOUT */}
        {messages.length > 0 && (
          <button 
            onClick={handleDeleteAll}
            disabled={isDeleting}
            style={{
              background: "none",
              border: "none",
              cursor: isDeleting ? "not-allowed" : "pointer",
              padding: "8px",
              color: "#ef4444", // Rouge
              display: "flex",
              alignItems: "center",
              fontSize: "12px",
              fontWeight: "bold",
              opacity: isDeleting ? 0.5 : 1
            }}
            title="Tout supprimer"
          >
            {isDeleting ? "Suppression..." : (
              <>
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6"></polyline>
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
                <span style={{ marginLeft: "4px" }}>Tout effacer</span>
              </>
            )}
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "20px" }}>
          <p style={{ fontSize: "12px", color: "#64748b" }}>
            Chargement de l'historique...
          </p>
        </div>
      ) : (
        <div className="sms-history-list">
          {messages.length === 0 && (
            <div style={{ textAlign: "center", padding: "30px" }}>
              <p style={{ fontSize: "14px", color: "#94a3b8" }}>
                 Aucun message envoyé pour le moment
              </p>
            </div>
          )}

          {messages.map((item) => (
            <div
              key={item.id}
              className="sms-history-item"
              onClick={() => setSelectedSms(item)}
            >
              <div className="sms-history-item-left">
                <span className="sms-history-sender">{item.senderName}</span>
                <span
                  className={`sms-history-status-badge ${
                    item.status === "Succès"
                      ? "sms-history-status-success"
                      : "sms-history-status-error"
                  }`}
                >
                  {item.status}
                </span>
              </div>

              <p className="sms-history-msg-preview">
                {item.message?.length > 60
                  ? item.message.substring(0, 60) + "..."
                  : item.message || "Message vide"}
              </p>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginTop: "8px",
                }}
              >
                <span className="sms-history-date">
                  {formatDate(item.createdAt)}
                </span>
                <span style={{ fontSize: "11px", color: "#94a3b8" }}>
                  → {item.receiverNumber}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {selectedSms && (
        <div
          className="sms-history-modal-backdrop"
          onClick={() => setSelectedSms(null)}
        >
          <div
            className="sms-history-modal-content"
            onClick={(e) => e.stopPropagation()}
          >
            <h3> Détails du message</h3>

            <div className="sms-history-modal-detail">
              <span className="sms-history-modal-label">EXPÉDITEUR</span>
              <strong>{selectedSms.senderName}</strong>
            </div>

            <div className="sms-history-modal-detail">
              <span className="sms-history-modal-label">DESTINATAIRE</span>
              <strong>{selectedSms.receiverNumber}</strong>
            </div>

            <div className="sms-history-modal-detail">
              <span className="sms-history-modal-label">STATUT</span>
              <span
                style={{
                  padding: "4px 12px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: "600",
                  backgroundColor:
                    selectedSms.status === "Succès" ? "#d4edda" : "#f8d7da",
                  color:
                    selectedSms.status === "Succès" ? "#155724" : "#721c24",
                }}
              >
                {selectedSms.status}
              </span>
            </div>

            {selectedSms.messageId && (
              <div className="sms-history-modal-detail">
                <span className="sms-history-modal-label">ID MESSAGE</span>
                <code
                  style={{
                    fontSize: "11px",
                    backgroundColor: "#f1f5f9",
                    padding: "4px 8px",
                    borderRadius: "4px",
                  }}
                >
                  {selectedSms.messageId}
                </code>
              </div>
            )}

            <div className="sms-history-modal-detail">
              <span className="sms-history-modal-label">MESSAGE COMPLET</span>
              <p
                style={{
                  whiteSpace: "pre-wrap",
                  lineHeight: "1.6",
                  backgroundColor: "#f8fafc",
                  padding: "12px",
                  borderRadius: "8px",
                  margin: "8px 0",
                }}
              >
                {selectedSms.message}
              </p>
            </div>

            <div className="sms-history-modal-detail">
              <span className="sms-history-modal-label">DATE D'ENVOI</span>
              <strong>{formatDate(selectedSms.createdAt)}</strong>
            </div>

            <button
              className="sms-history-btn-close"
              onClick={() => setSelectedSms(null)}
            >
              ✕ Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SmsSenderFormHistory;