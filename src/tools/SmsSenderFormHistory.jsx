import { useState, useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  limit,
} from "firebase/firestore";
import { db } from "../firebase/config";
import "./SmsSenderFormHistory.css";

const SmsSenderFormHistory = () => {
  const [messages, setMessages] = useState([]);
  const [selectedSms, setSelectedSms] = useState(null);
  const [loading, setLoading] = useState(true);

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
      <h2>Historique ({messages.length})</h2>

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
                📭 Aucun message envoyé pour le moment
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
                {item.message.length > 60
                  ? item.message.substring(0, 60) + "..."
                  : item.message}
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
            <h3>📱 Détails du message</h3>

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
