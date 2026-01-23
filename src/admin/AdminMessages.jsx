import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase/config";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  arrayUnion,
  Timestamp,
} from "firebase/firestore";
import { Search, Trash2, Send, ArrowLeft, CheckCheck } from "lucide-react";
import Loading from "../utilities/laoding/Loading"; // Correction orthographe "loading"
import "./AdminMessages.css";

const AdminMessages = () => {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsgId, setSelectedMsgId] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const chatEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const getAvatarColor = (name) => {
    const colors = ["#00a884", "#008f69", "#6559ff", "#ff8f00", "#e55a5a"];
    const index = name ? name.charCodeAt(0) % colors.length : 0;
    return colors[index];
  };

  // --- 1. ÉCOUTE DES DISCUSSIONS EN TEMPS RÉEL ---
  useEffect(() => {
    const q = query(
      collection(db, "contact_messages"),
      orderBy("createdAt", "desc"),
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        isRead: doc.data().isRead || false,
        replies: doc.data().replies || [],
      }));
      setMessages(msgs);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Scroll automatique et gestion du "typing"
  useEffect(() => {
    if (selectedMsgId) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [selectedMsgId, messages]);

  // --- 2. GESTION DE L'INDICATEUR "TYPING" ADMIN ---
  const handleAdminTyping = async (e) => {
    setReplyText(e.target.value);
    if (!selectedMsgId) return;

    const msgRef = doc(db, "contact_messages", selectedMsgId);

    // On prévient le client que l'admin écrit
    await updateDoc(msgRef, { adminIsTyping: e.target.value.length > 0 });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(async () => {
      await updateDoc(msgRef, { adminIsTyping: false });
    }, 3000);
  };

  // --- 3. ACTIONS ---
  const handleSelectMessage = async (msg) => {
    setSelectedMsgId(msg.id);
    if (!msg.isRead) {
      try {
        await updateDoc(doc(db, "contact_messages", msg.id), { isRead: true });
      } catch (error) {
        console.error("Erreur lecture:", error);
      }
    }
  };

  const handleBackToList = async () => {
    if (selectedMsgId) {
      // Stopper l'indicateur typing en quittant
      await updateDoc(doc(db, "contact_messages", selectedMsgId), {
        adminIsTyping: false,
      });
    }
    setSelectedMsgId(null);
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedMsgId) return;
    try {
      const msgRef = doc(db, "contact_messages", selectedMsgId);
      await updateDoc(msgRef, {
        replies: arrayUnion({
          text: replyText,
          sender: "admin",
          createdAt: Timestamp.now(),
        }),
        isRead: true,
        adminIsTyping: false, // Stopper l'indicateur après envoi
      });
      setReplyText("");
    } catch (error) {
      console.error("Erreur envoi:", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Supprimer cette discussion ?")) {
      try {
        await deleteDoc(doc(db, "contact_messages", selectedMsgId));
        setSelectedMsgId(null);
      } catch (error) {
        alert("Erreur");
      }
    }
  };

  const activeMessage = messages.find((m) => m.id === selectedMsgId);
  const filteredList = messages.filter(
    (msg) =>
      msg.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      msg.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const formatDateList = (timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    const now = new Date();
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString("fr-FR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return date.toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  const formatTimeBubble = (timestamp) => {
    if (!timestamp) return "";
    return timestamp
      .toDate()
      .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  if (loading) return <Loading />;

  return (
    <div className="messages-container">
      {/* --- VUE 1 : LISTE --- */}
      <div
        className={`view-sidebar full-width ${selectedMsgId ? "hidden" : ""}`}
      >
        <div className="sidebar-header">
          <h2>Discussions</h2>
          <div className="search-wrapper">
            <Search className="search-icon-pos" size={16} />
            <input
              type="text"
              placeholder="Rechercher..."
              className="search-input"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="message-list">
          {filteredList.map((msg) => {
            const displayName = msg.name || msg.email || "Inconnu";
            let lastText = msg.message;
            let isLastAdmin = false;
            if (msg.replies.length > 0) {
              lastText = msg.replies[msg.replies.length - 1].text;
              isLastAdmin =
                msg.replies[msg.replies.length - 1].sender === "admin";
            }

            return (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg)}
                className={`list-item ${!msg.isRead ? "unread" : ""}`}
              >
                <div
                  className="item-avatar"
                  style={{ backgroundColor: getAvatarColor(displayName) }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div className="item-content">
                  <div className="item-top-row">
                    <span className="item-name">{displayName}</span>
                    <span className="item-date">
                      {formatDateList(msg.createdAt)}
                    </span>
                  </div>
                  <div className="item-preview">
                    {isLastAdmin && (
                      <CheckCheck
                        size={14}
                        style={{ marginRight: 4, color: "#53bdeb" }}
                      />
                    )}
                    {lastText}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* --- VUE 2 : CHAT --- */}
      <div className={`view-chat full-width ${!selectedMsgId ? "hidden" : ""}`}>
        {activeMessage && (
          <>
            <div className="chat-header">
              <button className="back-btn" onClick={handleBackToList}>
                <ArrowLeft size={24} />
              </button>
              <div
                className="chat-avatar-small"
                style={{
                  backgroundColor: getAvatarColor(
                    activeMessage.name || activeMessage.email,
                  ),
                }}
              >
                {(activeMessage.name || activeMessage.email)
                  .charAt(0)
                  .toUpperCase()}
              </div>
              <div className="chat-info">
                <h3>{activeMessage.name || activeMessage.email}</h3>
                <span>{activeMessage.subject || "Support Technique"}</span>
              </div>
              <button onClick={handleDelete} className="delete-btn-header">
                <Trash2 size={20} />
              </button>
            </div>

            <div className="chat-messages">
              <div className="message-bubble received">
                {activeMessage.message}
                <span className="bubble-time">
                  {formatTimeBubble(activeMessage.createdAt)}
                </span>
              </div>

              {activeMessage.replies.map((reply, index) => (
                <div
                  key={index}
                  className={`message-bubble ${reply.sender === "admin" ? "sent" : "received"}`}
                >
                  {reply.text}
                  <span className="bubble-time">
                    {formatTimeBubble(reply.createdAt)}
                  </span>
                </div>
              ))}

              {/* INDICATEUR D'ÉCRITURE CLIENT */}
              {activeMessage.clientIsTyping && (
                <div className="typing-indicator received-typing">
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                  <div className="typing-dot"></div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="chat-input-area">
              <textarea
                placeholder="Tapez votre réponse..."
                rows="1"
                value={replyText}
                onChange={handleAdminTyping}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendReply();
                  }
                }}
              />
              <button
                onClick={handleSendReply}
                className="send-btn-chat"
                disabled={!replyText.trim()}
              >
                <Send size={24} />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AdminMessages;
