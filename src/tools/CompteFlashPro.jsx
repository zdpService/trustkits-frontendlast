import React, { useState, useContext, useEffect } from "react";
import { LANGUES, PAYS } from "../data/tableau des banque/data";
import "./CompteFlashPro.css";
import FlashAccountUpdater from "./mise à jour compte/FlashAccountUpdater";
import { CoinsContext } from "../context/CoinsContext";

import { auth, db, firebaseConfig } from "../firebase/config";
import { initializeApp, deleteApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import {
  collection,
  addDoc,
  Timestamp,
  doc,
  getDoc,
  setDoc,
} from "firebase/firestore";

import ModalVideo from "../video Modal/ModalVideo";
import { Lock } from "lucide-react";

const FRONTEND_URL =
  process.env.REACT_APP_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vantex.ink"
    : "http://localhost:3001");

const DEFAULT_COINS_COST = 10000;
const TEST_VIDEO_URL = "https://www.youtube.com/embed/W88TO2D9SC4";

const generatePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

const generateIban = (countryCode = "FR") => {
  const randomDigits = Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
  return `${countryCode}76${randomDigits.slice(0, 20)}`;
};

const generateActivationCode = () => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const PopupModal = ({ isOpen, content, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className={`internal-popup ${content.type}`}>
      <div className="popup-content">
        <h4>{content.title}</h4>
        <p>{content.message}</p>
        {content.details && (
          <div className="popup-details">
            {Object.entries(content.details).map(([key, value]) => (
              <p key={key}>
                <strong>{key} :</strong> {value}
              </p>
            ))}
          </div>
        )}
        <button onClick={onClose} className="popup-close-btn">
          Fermer
        </button>
      </div>
    </div>
  );
};

const CompteFlashPro = () => {
  const {
    coins,
    updateCoins,
    loading: coinsLoading,
    userUid,
  } = useContext(CoinsContext);

  const [actualCost, setActualCost] = useState(DEFAULT_COINS_COST);
  const [isAllowed, setIsAllowed] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [clientData, setClientData] = useState({
    nom: "",
    prenom: "",
    paysResidence: PAYS[0] || "France",
    adresseResidence: "",
    email: "",
    telephone: "",
    langueClient: LANGUES[0] || "Français",
    soldeInitial: "0,00",
    devise: "EUR", // ✅ CHANGÉ: Code ISO au lieu du symbole
    messageApresVirement: "",
    iban: "",
  });

  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: "",
    message: "",
    details: null,
    type: "info",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isModalVideoOpen, setIsModalVideoOpen] = useState(false);

  const currentCoins = coins || 0;
  const activeUserUid = userUid || auth.currentUser?.uid;

  useEffect(() => {
    const fetchServiceSettings = async () => {
      if (!activeUserUid) {
        setSettingsLoading(false);
        return;
      }
      try {
        const userDocRef = doc(db, "users", activeUserUid);
        const userSnap = await getDoc(userDocRef);
        if (userSnap.exists()) {
          const serviceConfig =
            userSnap.data().serviceSettings?.compte_flash_pro;
          if (serviceConfig) {
            if (serviceConfig.allowed === false) setIsAllowed(false);
            if (serviceConfig.cost !== undefined && serviceConfig.cost !== "")
              setActualCost(Number(serviceConfig.cost));
          }
        }
      } catch (error) {
        console.error("Erreur settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };
    fetchServiceSettings();
  }, [activeUserUid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "soldeInitial") return;
    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const showErrorPopup = (title, message) => {
    setPopupContent({ title, message, details: null, type: "error" });
    setShowPopup(true);
  };

  const showSuccessPopup = (title, message, details) => {
    setPopupContent({ title, message, details, type: "success" });
    setShowPopup(true);
  };

  const validateForm = () => {
    if (!clientData.nom.trim() || !clientData.prenom.trim()) {
      showErrorPopup("Erreur", "Nom et prénom requis.");
      return false;
    }
    if (!clientData.email.trim()) {
      showErrorPopup("Erreur", "Email valide requis.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!isAllowed)
      return showErrorPopup("Accès Refusé", "Service non disponible.");
    if (!activeUserUid)
      return showErrorPopup("Erreur", "Veuillez vous reconnecter.");
    if (!validateForm()) return;

    if (currentCoins < actualCost) {
      return showErrorPopup(
        "Solde Insuffisant",
        `Il vous manque ${(actualCost - currentCoins).toLocaleString()} coins.`
      );
    }

    setIsLoading(true);

    const pin = generatePin();
    const paysCode = clientData.paysResidence.substring(0, 2).toUpperCase();
    const iban = clientData.iban || generateIban(paysCode);
    const activationCode = generateActivationCode();
    const simulatedHash = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();
    const lienConnexion = `${FRONTEND_URL}/?cl=${simulatedHash}`;

    let secondaryApp = null;

    try {
      secondaryApp = initializeApp(firebaseConfig, "SecondaryApp");
      const secondaryAuth = getAuth(secondaryApp);

      const userCredential = await createUserWithEmailAndPassword(
        secondaryAuth,
        clientData.email,
        pin
      );
      const newClientUid = userCredential.user.uid;

      const clientProfileData = {
        uid: newClientUid,
        clientId: newClientUid,
        nom: clientData.nom,
        prenom: clientData.prenom,
        email: clientData.email,
        pinAccess: pin,
        solde: 0,
        devise: clientData.devise, // ✅ Maintenant c'est un code ISO (EUR, USD, etc.)
        iban: iban,
        paysResidence: clientData.paysResidence,
        adresseResidence: clientData.adresseResidence,
        telephone: clientData.telephone,
        hashLien: simulatedHash,
        lienConnexion: lienConnexion,
        codeActivationVirement: activationCode,
        langueClient: clientData.langueClient,
        messageApresVirement: clientData.messageApresVirement || "N/A",
        accountType: "Compte Courant Standard",
        countryFlag: "",
        etat: "Flash Compte actif",
        role: "client",
        createdAt: Timestamp.now(),
        creatorUid: activeUserUid,
      };

      await setDoc(doc(db, "clients", newClientUid), clientProfileData);

      const adminLogData = {
        ...clientProfileData,
        coutCreation: `${actualCost.toLocaleString()} Crédits`,
        relatedClientUid: newClientUid,
        dateCreation: Timestamp.now(),
      };

      await addDoc(collection(db, "clientAccesses"), adminLogData);

      console.log("✅ Compte créé avec succès ! UID:", newClientUid);

      await signOut(secondaryAuth);
      await deleteApp(secondaryApp);

      const newCoinsBalance = currentCoins - actualCost;
      await updateCoins(activeUserUid, newCoinsBalance);

      showSuccessPopup(
        "Accès Client Créé !",
        "Le compte a été créé directement dans Firebase.",
        {
          Lien: lienConnexion,
          Email: clientData.email,
          PIN: pin,
          "Code Virement": activationCode,
        }
      );

      setClientData({
        nom: "",
        prenom: "",
        paysResidence: PAYS[0],
        adresseResidence: "",
        email: "",
        telephone: "",
        langueClient: LANGUES[0],
        soldeInitial: 0,
        devise: "EUR", // ✅ CHANGÉ: Reset avec code ISO
        messageApresVirement: "",
        iban: "",
      });
    } catch (err) {
      console.error("❌ Erreur création:", err);
      if (secondaryApp) await deleteApp(secondaryApp).catch(console.error);

      let errorMsg = "Erreur inconnue.";
      if (err.code === "auth/email-already-in-use")
        errorMsg = "Cet email est déjà utilisé.";
      if (err.code === "auth/invalid-email")
        errorMsg = "Format d'email invalide.";

      showErrorPopup("Erreur de Création", errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    isLoading || coinsLoading || currentCoins < actualCost || !activeUserUid;

  if (coinsLoading) return <div>Chargement...</div>;

  if (!settingsLoading && !isAllowed) {
    return (
      <div className="compte-flash-pro-wrapper blocked-wrapper">
        <div className="blocked-content">
          <Lock size={48} color="#dc2626" />
          <h2>Service Non Disponible</h2>
          <p>L'accès à ce service est restreint.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <PopupModal
        isOpen={showPopup}
        content={popupContent}
        onClose={() => setShowPopup(false)}
      />

      <div className="compte-flash-pro-wrapper">
        <div className="compte-info">
          <h2 className="header-title">Compte flash pro</h2>
          <p className="coins-display">
            Coins disponibles :{" "}
            <strong className="coins-value">
              {currentCoins.toLocaleString()}
            </strong>
          </p>
          <div className="compte-info-box">
            Création de comptes pour App 2 directement synchronisés avec
            Firebase. Coût :{" "}
            <strong>{actualCost.toLocaleString()} coins</strong>.
          </div>
          <button
            className="video-button"
            onClick={() => setIsModalVideoOpen(true)}
          >
            Vidéo test →
          </button>
        </div>

        <div className="compte-form-section">
          <h3 className="form-section-title">Configuration Nouvel Accès</h3>

          <form className="client-creation-form" onSubmit={handleSubmit}>
            <div className="form-row name-fields">
              <div className="form-field">
                <label>Nom</label>
                <input
                  name="nom"
                  value={clientData.nom}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label>Prénom</label>
                <input
                  name="prenom"
                  value={clientData.prenom}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row address-fields">
              <div className="form-field">
                <label>Pays</label>
                <select
                  name="paysResidence"
                  value={clientData.paysResidence}
                  onChange={handleChange}
                  className="form-select"
                >
                  {PAYS.map((p, i) => (
                    <option key={i} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-field">
                <label>Adresse</label>
                <input
                  name="adresseResidence"
                  value={clientData.adresseResidence}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row contact-fields">
              <div className="form-field">
                <label>Email</label>
                <input
                  type="email"
                  name="email"
                  value={clientData.email}
                  onChange={handleChange}
                  required
                  className="form-input"
                />
              </div>
              <div className="form-field">
                <label>Téléphone</label>
                <input
                  type="tel"
                  name="telephone"
                  value={clientData.telephone}
                  onChange={handleChange}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row iban-field">
              <div className="form-field full-width">
                <label>IBAN (Auto si vide)</label>
                <input
                  name="iban"
                  value={clientData.iban}
                  onChange={handleChange}
                  placeholder="FR76..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-row language-field">
              <div className="form-field">
                <label>Langue</label>
                <select
                  name="langueClient"
                  value={clientData.langueClient}
                  onChange={handleChange}
                  className="form-select"
                >
                  {LANGUES.map((l, i) => (
                    <option key={i} value={l}>
                      {l}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-row balance-currency-fields">
              <div className="form-field">
                <label>Devise</label>
                <select
                  name="devise"
                  value={clientData.devise}
                  onChange={handleChange}
                  className="form-select"
                >
                  <option value="EUR">€ Euro</option>
                  <option value="USD">$ Dollar</option>
                  <option value="GBP">£ Livre</option>
                  <option value="NGN">₦ Naira</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-field full-width">
                <label>Message Après Virement</label>
                <textarea
                  name="messageApresVirement"
                  value={clientData.messageApresVirement}
                  onChange={handleChange}
                  className="form-input"
                  rows="3"
                ></textarea>
              </div>
            </div>

            <button
              type="submit"
              className="submit-button"
              disabled={isButtonDisabled}
            >
              {isLoading
                ? "Configuration en cours..."
                : `Créer le compte → ${actualCost.toLocaleString()} coins`}
            </button>
          </form>
        </div>

        <FlashAccountUpdater />
        <ModalVideo
          isOpen={isModalVideoOpen}
          onClose={() => setIsModalVideoOpen(false)}
          videoSource={TEST_VIDEO_URL}
          title="Demo"
          isLocal={false}
        />
      </div>
    </>
  );
};

export default CompteFlashPro;