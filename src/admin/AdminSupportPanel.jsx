// src/admin/AdminSupportPanel.jsx

import React, { useState, useEffect } from "react";
import { db } from "../firebase/config"; // Assurez-vous que le chemin est correct
import {
  collection,
  query,
  orderBy,
  onSnapshot, // Cet onSnapshot est pour Firestore
  doc,
  updateDoc,
  arrayUnion, // N'oubliez pas l'importation de arrayUnion
  where,
  serverTimestamp, // serverTimestamp est conservé pour lastUpdated (au niveau du document)
} from "firebase/firestore";

import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../utilities/laoding/Loading";
import PrimaryBtn from "../btn/PrimaryBtn";
import SecondaryBtn from "../btn/SecondaryBtn";
import "./SupportTicketForm.css"; // Assurez-vous d'avoir le bon chemin vers le CSS d'admin

const AdminSupportPanel = () => {
  const [tickets, setTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [adminResponse, setAdminResponse] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingResponse, setIsSubmittingResponse] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });
  const [isAdmin, setIsAdmin] = useState(false);
  const [filterStatus, setFilterStatus] = useState("Open");

  // Correction ici : Utiliser onAuthStateChanged directement pour l'authentification
  useEffect(() => {
    const auth = getAuth();
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user && user.email === "endrienj2@gmail.com") {
        // <<< Vérifiez cet email !
        setIsAdmin(true);
      } else {
        setIsAdmin(false);
      }
      setIsLoading(false);
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setTickets([]);
      return;
    }

    setIsLoading(true);
    let q;
    if (filterStatus === "All") {
      q = query(
        collection(db, "support_tickets"),
        orderBy("lastUpdated", "desc")
      );
    } else {
      q = query(
        collection(db, "support_tickets"),
        where("status", "==", filterStatus),
        orderBy("lastUpdated", "desc")
      );
    }

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedTickets = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTickets(fetchedTickets);
        setIsLoading(false);
      },
      (error) => {
        console.error("Erreur lors du chargement des tickets :", error);
        setNotification({
          message: "Erreur lors du chargement des tickets.",
          type: "error",
        });
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [isAdmin, filterStatus]);

  const handleSendResponse = async (ticketId) => {
    setNotification({ message: "", type: "" });

    if (!adminResponse.trim()) {
      setNotification({
        message: "Le message de réponse ne peut pas être vide.",
        type: "error",
      });
      return;
    }

    if (!isAdmin) {
      setNotification({
        message: "Vous n'êtes pas autorisé à répondre.",
        type: "error",
      });
      return;
    }

    setIsSubmittingResponse(true);
    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        messages: arrayUnion({
          sender: "admin",
          text: adminResponse,
          timestamp: new Date(), // <<< CORRECTION ICI : Utilisez new Date()
        }),
        lastUpdated: serverTimestamp(), // Ceci est correct (au niveau du document)
        status: "In Progress",
      });
      setAdminResponse("");
      setNotification({
        message: "Votre réponse a été envoyée.",
        type: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi de la réponse :", error);
      setNotification({
        message: `Erreur: Impossible d'envoyer la réponse. (${error.message})`,
        type: "error",
      });
    } finally {
      setIsSubmittingResponse(false);
    }
  };

  const handleUpdateStatus = async (ticketId, newStatus) => {
    setNotification({ message: "", type: "" });
    if (!isAdmin) {
      setNotification({
        message: "Vous n'êtes pas autorisé à modifier le statut.",
        type: "error",
      });
      return;
    }

    setIsLoading(true);
    try {
      const ticketRef = doc(db, "support_tickets", ticketId);
      await updateDoc(ticketRef, {
        status: newStatus,
        lastUpdated: serverTimestamp(),
      });
      setNotification({
        message: `Le statut du ticket a été mis à jour à "${newStatus}".`,
        type: "success",
      });
      setSelectedTicket((prev) =>
        prev ? { ...prev, status: newStatus } : null
      );
    } catch (error) {
      console.error("Erreur lors de la mise à jour du statut :", error);
      setNotification({
        message: `Erreur: Impossible de mettre à jour le statut. (${error.message})`,
        type: "error",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "N/A";
    if (timestamp.toDate) {
      return timestamp.toDate().toLocaleString("fr-FR", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return new Date(timestamp).toLocaleString("fr-FR", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading && !selectedTicket) {
    return <Loading message="Chargement des tickets de support..." />;
  }

  if (!isAdmin) {
    return (
      <div className="admin-panel-unauthorized">
        Accès refusé. Cette page est réservée aux administrateurs.
      </div>
    );
  }

  return (
    <div className="admin-support-panel">
      <h1>Panneau d'Administration du Support</h1>
      <p>Gérez ici les demandes de support de vos utilisateurs.</p>

      {notification.message && (
        <div className={`notification notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      {selectedTicket ? (
        <div className="ticket-detail-view">
          <SecondaryBtn
            onClick={() => setSelectedTicket(null)}
            className="back-to-list-btn"
          >
            Retour à la liste des tickets
          </SecondaryBtn>

          <div className="ticket-header">
            <h2>
              Ticket #{selectedTicket.id.substring(0, 8)} :{" "}
              {selectedTicket.subject}
            </h2>
            <p>
              <strong>De:</strong> {selectedTicket.userEmail}
            </p>
            <p>
              <strong>Statut:</strong>
              <span
                className={`status-badge status-${selectedTicket.status
                  .toLowerCase()
                  .replace(" ", "-")}`}
              >
                {selectedTicket.status}
              </span>
            </p>
            <p>
              <strong>Créé le:</strong> {formatDate(selectedTicket.createdAt)}
            </p>
            <p>
              <strong>Dernière mise à jour:</strong>{" "}
              {formatDate(selectedTicket.lastUpdated)}
            </p>

            <div className="ticket-actions">
              {selectedTicket.status !== "Closed" && (
                <PrimaryBtn
                  onClick={() =>
                    handleUpdateStatus(selectedTicket.id, "Closed")
                  }
                  disabled={isLoading}
                  className="close-ticket-btn"
                >
                  Fermer le ticket
                </PrimaryBtn>
              )}
              {selectedTicket.status === "Closed" && (
                <SecondaryBtn
                  onClick={() => handleUpdateStatus(selectedTicket.id, "Open")}
                  disabled={isLoading}
                  className="reopen-ticket-btn"
                >
                  Rouvrir le ticket
                </SecondaryBtn>
              )}
              {selectedTicket.status === "Open" && (
                <PrimaryBtn
                  onClick={() =>
                    handleUpdateStatus(selectedTicket.id, "In Progress")
                  }
                  disabled={isLoading}
                  className="in-progress-ticket-btn"
                >
                  Marquer comme "En cours"
                </PrimaryBtn>
              )}
            </div>
          </div>

          <div className="message-list">
            <h3>Conversation:</h3>
            {selectedTicket.messages &&
              selectedTicket.messages.map((msg, index) => (
                <div
                  key={index}
                  className={`message-bubble message-${msg.sender}`}
                >
                  <p className="message-sender">
                    {msg.sender === "admin"
                      ? "Vous"
                      : selectedTicket.userEmail.split("@")[0]}
                    <span className="message-timestamp">
                      {formatDate(msg.timestamp)}
                    </span>
                  </p>
                  <p className="message-text">{msg.text}</p>
                </div>
              ))}
          </div>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendResponse(selectedTicket.id);
            }}
            className="admin-response-form"
          >
            <div className="form-group">
              <label htmlFor="adminResponse">Votre réponse :</label>
              <textarea
                id="adminResponse"
                value={adminResponse}
                onChange={(e) => setAdminResponse(e.target.value)}
                rows="4"
                placeholder="Écrivez votre réponse ici..."
                required
                disabled={isSubmittingResponse}
              />
            </div>
            <PrimaryBtn type="submit" disabled={isSubmittingResponse}>
              {isSubmittingResponse ? "Envoi..." : "Envoyer la réponse"}
            </PrimaryBtn>
          </form>
        </div>
      ) : (
        <div className="ticket-list-view">
          <div className="filter-options">
            <span>Filtrer par statut:</span>
            <select
              onChange={(e) => setFilterStatus(e.target.value)}
              value={filterStatus}
            >
              <option value="Open">Ouvert</option>
              <option value="In Progress">En cours</option>
              <option value="Closed">Fermé</option>
              <option value="All">Tous</option>
            </select>
          </div>

          {tickets.length === 0 && !isLoading && (
            <p className="no-tickets">
              Aucun ticket trouvé pour le statut "{filterStatus}".
            </p>
          )}

          <div className="ticket-cards-container">
            {tickets.map((ticket) => (
              <div
                key={ticket.id}
                className="ticket-card"
                onClick={() => setSelectedTicket(ticket)}
              >
                <div className="card-header">
                  <h3>{ticket.subject}</h3>
                  <span
                    className={`status-badge status-${ticket.status
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {ticket.status}
                  </span>
                </div>
                <p className="card-info">De: {ticket.userEmail}</p>
                <p className="card-info">
                  Dernière mise à jour: {formatDate(ticket.lastUpdated)}
                </p>
                <p className="card-snippet">
                  {ticket.messages[ticket.messages.length - 1]?.text.substring(
                    0,
                    100
                  )}
                  ...
                </p>
                <SecondaryBtn className="view-ticket-btn">
                  Voir le ticket
                </SecondaryBtn>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminSupportPanel;
