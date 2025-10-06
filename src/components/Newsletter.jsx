// src/pages/admin/Newsletter.jsx

import React, { useState, useEffect } from "react";
import "./Newsletter.css";
import PrimaryBtn from "../btn/PrimaryBtn";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { db } from "../firebase/config";
import {
  collection,
  addDoc,
  serverTimestamp,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import emailjs from "@emailjs/browser"; // <-- NOUVELLE IMPORTATION

// 🚨 REMPLACEZ CES VALEURS PAR VOS PROPRES IDENTIFIANTS EMAILJS 🚨
const SERVICE_ID = "service_zxwdu7b"; // Ex: gmail_service
const WELCOME_TEMPLATE_ID = "template_1xv5zns"; // Le template de bienvenue que nous avons défini
const PUBLIC_KEY = "BZIPSCjPsFln1tAPU"; // Votre clé publique (User ID)

const Newsletter = () => {
  const [email, setEmail] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [uid, setUid] = useState(null);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsConnected(!!user);
      if (user) {
        setUid(user.uid);
        if (user.email) {
          setEmail(user.email);
        }
      } else {
        setUid(null);
        setEmail("");
      }
      setMessage("");
      setMessageType("");
    });
    return () => unsubscribe();
  }, []);

  // Effet pour vérifier si l'utilisateur est déjà abonné quand il se connecte
  useEffect(() => {
    const checkSubscriptionStatus = async () => {
      if (isConnected && uid) {
        try {
          const q = query(
            collection(db, "newsletter"),
            where("uid", "==", uid)
          );
          const querySnapshot = await getDocs(q);

          if (!querySnapshot.empty) {
            setMessage(
              "Vous êtes déjà abonné à notre newsletter avec ce compte."
            );
            setMessageType("info");
          } else {
            setMessage("");
            setMessageType("");
          }
        } catch (error) {
          console.error(
            "Erreur lors de la vérification de l'abonnement :",
            error
          );
          setMessage("Erreur lors de la vérification de l'abonnement.");
          setMessageType("error");
        }
      }
    };
    checkSubscriptionStatus();
  }, [isConnected, uid]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setMessageType("");

    if (!isConnected) {
      setMessage("Vous devez être connecté pour vous abonner.");
      setMessageType("error");
      navigate("/login");
      return;
    }

    if (!email) {
      setMessage("Veuillez saisir une adresse e-mail.");
      setMessageType("error");
      return;
    }

    try {
      // 1. Vérifier si l'email ou l'UID est déjà inscrit
      const qEmail = query(
        collection(db, "newsletter"),
        where("email", "==", email)
      );
      const qUid = query(collection(db, "newsletter"), where("uid", "==", uid));

      const [emailSnapshot, uidSnapshot] = await Promise.all([
        getDocs(qEmail),
        getDocs(qUid),
      ]);

      if (!emailSnapshot.empty) {
        setMessage("Cette adresse e-mail est déjà abonnée !");
        setMessageType("info");
        return;
      }
      if (!uidSnapshot.empty) {
        setMessage("Votre compte est déjà abonné à notre newsletter !");
        setMessageType("info");
        return;
      }

      // 2. Si non inscrit, ajouter le nouvel abonnement à Firestore
      await addDoc(collection(db, "newsletter"), {
        email,
        uid,
        date: serverTimestamp(),
      });

      // 3. Envoyer l'e-mail de bienvenue via EmailJS
      try {
        const welcomeParams = {
          to_email: email, // L'adresse de l'utilisateur qui vient de s'abonner
          // Le template de bienvenue utilise uniquement to_email
        };

        await emailjs.send(
          SERVICE_ID,
          WELCOME_TEMPLATE_ID,
          welcomeParams,
          PUBLIC_KEY
        );
        console.log("E-mail de bienvenue envoyé avec succès via EmailJS.");
      } catch (emailError) {
        console.error(
          "Erreur lors de l'envoi de l'e-mail de bienvenue:",
          emailError
        );
        // Nous n'affichons pas cette erreur à l'utilisateur car l'abonnement à Firestore a réussi.
      }

      // 4. Message de succès final
      setMessage(
        "Merci pour votre inscription ! Un e-mail de bienvenue vous a été envoyé."
      );
      setMessageType("success");
      setEmail(""); // Réinitialiser l'email après succès
    } catch (error) {
      console.error("Erreur lors de l’abonnement :", error);
      setMessage("Erreur lors de l’abonnement, veuillez réessayer.");
      setMessageType("error");
    }
  };

  return (
    <section className="newsletter">
      <div className="newsletter__content">
        <h2>S'abonner à notre newsletter</h2>
        <p>Ne ratez aucune nouvelle concernant les mises à jour disponibles.</p>
        <form className="newsletter__form" onSubmit={handleSubmit}>
          <input
            type="email"
            placeholder="Adresse e-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={
              !isConnected ||
              (messageType === "info" && message.includes("déjà abonné"))
            }
          />
          <div>
            <PrimaryBtn
              type="submit"
              disabled={
                !isConnected ||
                (messageType === "info" && message.includes("déjà abonné")) ||
                !email // Désactiver si le champ email est vide
              }
            >
              S'abonner
            </PrimaryBtn>
          </div>
        </form>

        {/* Affichage des messages */}
        {message && (
          <p
            className={`newsletter__message newsletter__message--${messageType}`}
          >
            {message}
          </p>
        )}

        {!isConnected && (
          <p className="newsletter__message newsletter__message--error">
            Connectez-vous pour pouvoir vous abonner.
          </p>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
