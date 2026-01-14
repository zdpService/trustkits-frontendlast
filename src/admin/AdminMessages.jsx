import React, { useEffect, useState } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import {
  Mail,
  Search,
  Trash2,
  Reply,
  CheckCircle,
  Circle,
  Clock,
} from "lucide-react";
import Loading from "../utilities/laoding/Loading";
import "./AdminMessages.css";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    // Écoute en temps réel de la collection
    const q = query(
      collection(db, "contact_messages"),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const msgs = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          // Si le champ 'read' n'existe pas, on le considère comme faux par défaut
          isRead: doc.data().isRead || false,
        }));
        setMessages(msgs);
        setLoading(false);
      },
      (error) => {
        console.error("Erreur messages:", error);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --- ACTIONS ---

  const handleDelete = async (id) => {
    if (window.confirm("Voulez-vous vraiment supprimer ce message ?")) {
      try {
        await deleteDoc(doc(db, "contact_messages", id));
      } catch (error) {
        alert("Erreur lors de la suppression");
      }
    }
  };

  const handleMarkAsRead = async (id, currentStatus) => {
    try {
      await updateDoc(doc(db, "contact_messages", id), {
        isRead: !currentStatus,
      });
    } catch (error) {
      console.error("Erreur update status:", error);
    }
  };

  const handleReply = (email, subject) => {
    window.location.href = `mailto:${email}?subject=Réponse: ${subject}`;
  };

  // --- FILTRES ---
  const filteredMessages = messages.filter(
    (msg) =>
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.subject?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.message?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <Loading />;

  return (
    <div className="messages-container">
      {/* HEADER AVEC RECHERCHE */}
      <div className="messages-header">
        <div>
          <h1>Boîte de Réception</h1>
          <p className="subtitle">
            {messages.filter((m) => !m.isRead).length} messages non lus
          </p>
        </div>

        <div className="search-bar-message">
          <Search size={18} color="#6b7280" />
          <input
            type="text"
            placeholder="Rechercher un message..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* LISTE DES MESSAGES */}
      <div className="messages-grid-layout">
        {filteredMessages.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <Mail size={40} />
            </div>
            <p>Aucun message trouvé.</p>
          </div>
        ) : (
          filteredMessages.map((msg) => (
            <div
              key={msg.id}
              className={`message-ticket ${msg.isRead ? "read" : "unread"}`}
            >
              {/* INDICATEUR GAUCHE */}
              <div className="message-status-stripe"></div>

              <div className="message-body">
                {/* EN-TÊTE DU TICKET */}
                <div className="ticket-header">
                  <div className="sender-info">
                    <div className="sender-avatar">
                      {msg.email ? msg.email.charAt(0).toUpperCase() : "?"}
                    </div>
                    <div>
                      <h3 className="sender-email">{msg.email || "Anonyme"}</h3>
                      <span className="message-date">
                        <Clock size={12} />
                        {msg.createdAt?.toDate
                          ? msg.createdAt.toDate().toLocaleString("fr-FR")
                          : "Date inconnue"}
                      </span>
                    </div>
                  </div>

                  {/* ACTIONS */}
                  <div className="ticket-actions">
                    <button
                      className="action-icon reply"
                      title="Répondre"
                      onClick={() => handleReply(msg.email, msg.subject)}
                    >
                      <Reply size={18} />
                    </button>
                    <button
                      className={`action-icon read-toggle ${
                        msg.isRead ? "is-read" : ""
                      }`}
                      title={msg.isRead ? "Marquer non lu" : "Marquer comme lu"}
                      onClick={() => handleMarkAsRead(msg.id, msg.isRead)}
                    >
                      {msg.isRead ? (
                        <CheckCircle size={18} />
                      ) : (
                        <Circle size={18} />
                      )}
                    </button>
                    <button
                      className="action-icon delete"
                      title="Supprimer"
                      onClick={() => handleDelete(msg.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* CONTENU */}
                <div className="ticket-content">
                  <h4 className="message-subject">
                    {msg.subject || "Sans objet"}
                  </h4>
                  <p className="message-text">{msg.message}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
