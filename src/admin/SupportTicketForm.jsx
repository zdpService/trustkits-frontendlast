import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
// Note: serverTimestamp est conservé pour createdAt et lastUpdated (qui ne sont pas dans un array)
import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Loading from "../utilities/laoding/Loading";
import PrimaryBtn from "../btn/PrimaryBtn";
import "./SupportTicketForm.css";

const SupportTicketForm = () => {
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState({ message: "", type: "" });

  // 1. Récupérer l'utilisateur actuel et son email
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      setUserEmail(user.email);
    }
    setIsLoading(false);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setNotification({ message: "", type: "" });

    if (!subject.trim() || !message.trim()) {
      setNotification({
        message: "Veuillez remplir le sujet et le message.",
        type: "error",
      });
      return;
    }

    if (!userEmail) {
      setNotification({
        message: "Utilisateur non authentifié. Veuillez vous reconnecter.",
        type: "error",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 2. Ajouter le nouveau document (ticket) à Firestore
      await addDoc(collection(db, "support_tickets"), {
        userId: getAuth().currentUser.uid,
        userEmail: userEmail,
        subject: subject,
        // Le premier message est stocké comme un tableau de messages
        messages: [
          {
            sender: "user",
            text: message,
            // CORRECTION: Remplacer serverTimestamp() par new Date()
            // car serverTimestamp n'est pas supporté dans les arrays.
            timestamp: new Date(),
          },
        ],
        status: "Open", // Statut initial du ticket
        createdAt: serverTimestamp(), // Ceci est correct
        lastUpdated: serverTimestamp(), // Ceci est correct
      });

      // 3. Succès et réinitialisation du formulaire
      setSubject("");
      setMessage("");
      setNotification({
        message:
          "Votre message a été envoyé ! Nous vous répondrons dès que possible.",
        type: "success",
      });
    } catch (error) {
      console.error("Erreur lors de l'envoi du ticket :", error);
      setNotification({
        message: `Erreur: Impossible d'envoyer votre message. (${error.message})`,
        type: "error",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Loading message="Chargement du formulaire..." />;
  }

  // Le composant doit être intégré dans une route accessible uniquement aux utilisateurs connectés.
  if (!userEmail) {
    return (
      <div className="support-form-unauthenticated">
        Veuillez vous connecter pour accéder au support.
      </div>
    );
  }

  return (
    <div className="support-ticket-form">
      <h2>Envoyer une demande de support</h2>
      <p>
        Décrivez votre problème ou votre question ci-dessous. Nous vous
        répondrons par e-mail ou directement ici.
      </p>

      {notification.message && (
        <div className={`notification notification--${notification.type}`}>
          {notification.message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="subject">Sujet de la demande :</label>
          <input
            id="subject"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Ex: Problème de connexion ou Nouvelle fonctionnalité ?"
            required
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="message">Votre message :</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows="6"
            placeholder="Expliquez en détail votre situation."
            required
            disabled={isSubmitting}
          />
        </div>

        <p className="form-info">
          Envoyé par : <strong>{userEmail}</strong>
        </p>

        <PrimaryBtn
          type="submit"
          disabled={isSubmitting}
          className="submit-ticket-btn"
        >
          {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
        </PrimaryBtn>
      </form>
    </div>
  );
};

export default SupportTicketForm;
