import React, { useState, useEffect, useRef } from "react";
import "./ContactForm.css";
import AccountLayout from "../layout/AccountLayout";
import { db, auth } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import {
  PlusCircle,
  MessageSquare,
  ArrowLeft,
  Clock,
  Send,
} from "lucide-react";

const ContactForm = () => {
  // --- ÉTATS ---
  const [view, setView] = useState("list"); // 'list', 'create', 'chat'
  const [myTickets, setMyTickets] = useState([]);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    message: "",
  });
  const [status, setStatus] = useState("");
  const [replyText, setReplyText] = useState("");

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const user = auth.currentUser;

  // --- 1. CHARGEMENT ET ÉCOUTE DES MESSAGES ---
  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "contact_messages"),
      where("email", "==", user.email),
      orderBy("createdAt", "desc"),
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tickets = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMyTickets(tickets);
      setLoading(false);

      // Mise à jour du ticket sélectionné pour voir les réponses et le "typing" en direct
      if (selectedTicket) {
        const updated = tickets.find((t) => t.id === selectedTicket.id);
        if (updated) setSelectedTicket(updated);
      }
    });

    return () => unsubscribe();
  }, [user, selectedTicket?.id]); // On surveille l'ID pour éviter les boucles

  // Scroll automatique vers le bas
  useEffect(() => {
    if (view === "chat") {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedTicket?.replies, selectedTicket?.adminIsTyping, view]);

  // --- 2. GESTION DE L'INDICATEUR "EN TRAIN D'ÉCRIRE" ---
  const handleTyping = async (e) => {
    setReplyText(e.target.value);
    if (!selectedTicket) return;

    const ticketRef = doc(db, "contact_messages", selectedTicket.id);

    // On prévient l'admin que le client écrit
    await updateDoc(ticketRef, { clientIsTyping: e.target.value.length > 0 });

    // Nettoyage du timer précédent
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    // Après 3 secondes sans taper, on retire l'indicateur
    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(ticketRef, { clientIsTyping: false });
    }, 3000);
  };

  // --- 3. ACTIONS ---

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!user) return;
    setStatus("sending");

    try {
      await addDoc(collection(db, "contact_messages"), {
        name: formData.name || user.displayName || "Utilisateur",
        email: user.email,
        subject: formData.subject,
        message: formData.message,
        isRead: false,
        createdAt: serverTimestamp(),
        replies: [],
        clientIsTyping: false,
        adminIsTyping: false,
      });

      setStatus("success");
      setFormData({ name: "", subject: "", message: "" });
      setTimeout(() => {
        setStatus("");
        setView("list");
      }, 1500);
    } catch (error) {
      console.error("Erreur création:", error);
      setStatus("error");
    }
  };

  const handleUserReply = async () => {
    if (!replyText.trim() || !selectedTicket) return;

    try {
      const ticketRef = doc(db, "contact_messages", selectedTicket.id);

      await updateDoc(ticketRef, {
        replies: arrayUnion({
          text: replyText,
          sender: "client",
          createdAt: Timestamp.now(),
        }),
        isRead: false, // Notifie l'admin d'un nouveau message
        clientIsTyping: false, // On arrête l'indicateur après envoi
      });

      setReplyText("");
    } catch (error) {
      console.error("Erreur réponse:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // --- VUES ---

  const renderList = () => (
    <div className="view-list">
      <div className="contact-header">
        <div>
          <h3>Mes discussions</h3>
          <p className="subtitle">Échanges avec le support technique</p>
        </div>
        <button className="btn-primary" onClick={() => setView("create")}>
          <PlusCircle size={18} /> Nouveau message
        </button>
      </div>

      {loading ? (
        <p>Chargement...</p>
      ) : myTickets.length === 0 ? (
        <div className="empty-tickets">
          <MessageSquare size={40} />
          <p>Aucune discussion trouvée.</p>
        </div>
      ) : (
        <div className="ticket-list">
          {myTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="ticket-card"
              onClick={() => {
                setSelectedTicket(ticket);
                setView("chat");
              }}
            >
              <div className="ticket-info">
                <h4>{ticket.subject}</h4>
                <div className="ticket-meta">
                  <Clock size={12} /> {formatDate(ticket.createdAt)}
                </div>
              </div>
              <span
                className={`ticket-status ${ticket.replies?.length > 0 && ticket.replies[ticket.replies.length - 1].sender === "admin" ? "replied" : ""}`}
              >
                {ticket.replies?.length > 0 &&
                ticket.replies[ticket.replies.length - 1].sender === "admin"
                  ? "Réponse reçue"
                  : "Envoyé"}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  const renderChat = () => (
    <div className="view-chat">
      <div className="contact-header">
        <button
          className="btn-back"
          onClick={() => {
            setView("list");
            setSelectedTicket(null);
          }}
        >
          <ArrowLeft size={18} /> Retour
        </button>
        <h3 className="chat-title">{selectedTicket?.subject}</h3>
      </div>

      <div className="chat-window">
        <div className="chat-messages-container">
          {/* Message initial */}
          <div className="message-bubble user">
            <p>{selectedTicket?.message}</p>
            <span className="msg-date">
              Vous - {formatDate(selectedTicket?.createdAt)}
            </span>
          </div>

          {/* Réponses fil de discussion */}
          {selectedTicket?.replies?.map((rep, idx) => (
            <div
              key={idx}
              className={`message-bubble ${rep.sender === "client" ? "user" : "admin"}`}
            >
              <p>{rep.text}</p>
              <span className="msg-date">
                {rep.sender === "client" ? "Vous" : "Support"} -{" "}
                {formatDate(rep.createdAt)}
              </span>
            </div>
          ))}

          {/* INDICATEUR D'ÉCRITURE ADMIN */}
          {selectedTicket?.adminIsTyping && (
            <div className="typing-indicator admin-typing">
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
              <div className="typing-dot"></div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <textarea
            placeholder="Écrivez votre réponse..."
            rows="2"
            value={replyText}
            onChange={handleTyping}
            onKeyDown={(e) =>
              e.key === "Enter" &&
              !e.shiftKey &&
              (e.preventDefault(), handleUserReply())
            }
          />
          <button
            className="btn-send-reply"
            onClick={handleUserReply}
            disabled={!replyText.trim()}
          >
            <Send size={20} />
          </button>
        </div>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="view-create">
      <div className="contact-header">
        <button className="btn-back" onClick={() => setView("list")}>
          <ArrowLeft size={18} /> Annuler
        </button>
        <h3>Ouvrir un ticket</h3>
      </div>
      <form className="contact-form" onSubmit={handleCreateTicket}>
        <div className="form-group">
          <label>Sujet :</label>
          <input
            type="text"
            value={formData.subject}
            onChange={(e) =>
              setFormData({ ...formData, subject: e.target.value })
            }
            required
            placeholder="Ex: Problème de connexion..."
          />
        </div>
        <div className="form-group">
          <label>Message :</label>
          <textarea
            value={formData.message}
            onChange={(e) =>
              setFormData({ ...formData, message: e.target.value })
            }
            rows="6"
            required
            placeholder="Décrivez votre problème..."
          />
        </div>
        <button type="submit" disabled={status === "sending"}>
          {status === "sending" ? "Envoi..." : "Envoyer"}
        </button>
        {status === "success" && (
          <p className="success-msg">Message envoyé !</p>
        )}
      </form>
    </div>
  );

  return (
    <AccountLayout>
      <div className="contact-container">
        {view === "list" && renderList()}
        {view === "chat" && renderChat()}
        {view === "create" && renderCreate()}
      </div>
    </AccountLayout>
  );
};

export default ContactForm;
