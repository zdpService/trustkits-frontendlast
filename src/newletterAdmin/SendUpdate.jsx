import React, { useState, useEffect } from "react";
import { db } from "../firebase/config";
import { collection, getDocs, addDoc } from "firebase/firestore";
import emailjs from "@emailjs/browser";
import Loading from "../utilities/laoding/Loading";
import "./SendUpdate.css";
import AccountLayout from "../layout/AccountLayout";

const SERVICE_ID = "service_pp2at2m";
const TEMPLATE_ID = "template_1gbygtj";
const PUBLIC_KEY = "BZIPSCjPsFln1tAPU";

const SendUpdate = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [isSending, setIsSending] = useState(true);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    const fetchSubscribers = async () => {
      try {
        const subscribersRef = collection(db, "newsletter");
        const snapshot = await getDocs(subscribersRef);

        const emails = snapshot.docs
          .map((doc) => doc.data().email)
          .filter(Boolean);
        setSubscribers(emails);
      } catch (error) {
        console.error("Erreur lors de la récupération des abonnés:", error);
        setMessage(
          "Erreur lors du chargement des abonnés. Vérifiez Firestore."
        );
        setMessageType("error");
      } finally {
        setIsSending(false);
      }
    };
    fetchSubscribers();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!title.trim() || !content.trim()) {
      setMessage("Le titre et le contenu ne doivent pas être vides.");
      setMessageType("error");
      return;
    }

    if (subscribers.length === 0) {
      setMessage("Aucun abonné trouvé. Annulation de l'envoi.");
      setMessageType("error");
      return;
    }

    setIsSending(true);
    let successCount = 0;
    let failedCount = 0;

    try {
      for (const email of subscribers) {
        const templateParams = {
          to_email: email,
          title: title,
          content: content.replace(/\n/g, "<br>"),
          from_email: "trustkits.update@gmail.com",
        };

        const result = await emailjs.send(
          SERVICE_ID,
          TEMPLATE_ID,
          templateParams,
          PUBLIC_KEY
        );

        if (result.status === 200) {
          successCount++;
        } else {
          failedCount++;
          console.error(`Échec de l'envoi à ${email}:`, result.text);
        }
      }
      await addDoc(collection(db, "updates_log"), {
        title: title,
        totalSubscribers: subscribers.length,
        successCount: successCount,
        failedCount: failedCount,
        timestamp: new Date(),
      });

      setTitle("");
      setContent("");
      setMessage(
        `Envoi terminé : ${successCount} succès, ${failedCount} échecs.`
      );
      setMessageType(failedCount > 0 ? "error" : "success");
    } catch (error) {
      console.error("Erreur générale lors de l'envoi :", error);
      setMessage(
        "Une erreur majeure s'est produite lors de la boucle d'envoi. Consultez la console."
      );
      setMessageType("error");
    } finally {
      setIsSending(false);
    }
  };

  if (isSending) {
    return (
      <Loading
        message={
          subscribers.length > 0
            ? `Envoi en cours à ${subscribers.length} abonnés...`
            : `Chargement des abonnés...`
        }
      />
    );
  }

  return (
    <AccountLayout>
      <div className="send-update-container">
        <h1>Notifier les abonnés ({subscribers.length} abonnés trouvés)</h1>
        <p>
          Ce formulaire utilise EmailJS pour envoyer les notifications.
          N'oubliez pas de vérifier vos limites d'envoi EmailJS.
        </p>

        {message && (
          <div
            className={`notification-message notification-message--${messageType}`}
          >
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="update-form">
          <div className="form-group">
            <label htmlFor="title">
              Titre de la mise à jour (Objet de l'e-mail) :
            </label>

            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="Ex: Nouvelle fonctionnalité de virement pro disponible !"
            />
          </div>

          <div className="form-group">
            <label htmlFor="content">Contenu du message :</label>

            <textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              required
              rows="10"
              placeholder="Détaillez ici les nouveautés, les correctifs ou les informations importantes."
            />
          </div>

          <button
            type="submit"
            disabled={isSending}
            className="submit-update-btn"
          >
            {"Envoyer la Notification"}
          </button>
        </form>
      </div>
    </AccountLayout>
  );
};

export default SendUpdate;
