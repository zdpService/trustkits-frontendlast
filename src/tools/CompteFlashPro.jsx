import React, { useState, useContext } from "react";
import { LANGUES, PAYS } from "../data/tableau des banque/data";
import "./CompteFlashPro.css";
import FlashAccountUpdater from "./mise à jour compte/FlashAccountUpdater";
import { CoinsContext } from "../context/CoinsContext";
import { auth, db } from "../firebase/config";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import axios from "axios";
import ModalVideo from "../video Modal/ModalVideo";

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://trust-kits-backend.onrender.com"
    : "http://localhost:8080");
const API_REGISTER_URL = `${API_BASE_URL}/api/clients/register`;

const FRONTEND_URL =
  process.env.REACT_APP_FRONTEND_URL ||
  (process.env.NODE_ENV === "production"
    ? "https://vantex.ink"
    : "http://localhost:3001");

const COINS_COST = 10000;
const TEST_VIDEO_URL = "https://www.youtube.com/embed/W88TO2D9SC4";

const generatePin = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const generateIban = (countryCode = "FR") => {
  const randomDigits = Math.floor(
    1000000000000000 + Math.random() * 9000000000000000
  ).toString();
  return `${countryCode}76${randomDigits.slice(0, 20)}`;
};

/**
 * @returns {string} Le code généré.
 */
const generateActivationCode = () => {
  const characters = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let result = "";
  const length = 6;
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

const CompteFlashPro = () => {
  const {
    coins,
    updateCoins,
    loading: coinsLoading,
    userUid,
  } = useContext(CoinsContext);

  const [clientData, setClientData] = useState({
    nom: "",
    prenom: "",
    paysResidence: PAYS[0] || "France",
    adresseResidence: "",
    email: "",
    telephone: "",
    langueClient: LANGUES[0] || "Français",
    soldeInitial: "0,00",
    devise: "€",
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "soldeInitial") return;

    setClientData((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    if (!clientData.nom.trim() || !clientData.prenom.trim()) {
      setPopupContent({
        title: "Erreur de Validation",
        message: "Veuillez entrer le nom et le prénom du client.",
        type: "error",
      });
      setShowPopup(true);
      return false;
    }
    if (!clientData.email.trim()) {
      setPopupContent({
        title: "Erreur de Validation",
        message: "Veuillez entrer une adresse e-mail valide.",
        type: "error",
      });
      setShowPopup(true);
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setShowPopup(false);
    setPopupContent({ title: "", message: "", details: null, type: "info" });

    if (!activeUserUid) {
      setPopupContent({
        title: "Erreur d'Authentification",
        message: "Erreur d'authentification. Veuillez vous reconnecter.",
        type: "error",
      });
      setShowPopup(true);
      return;
    }

    if (!validateForm()) return;

    if (currentCoins < COINS_COST) {
      setPopupContent({
        title: "Solde de Coins Insuffisant",
        message: `Votre solde est insuffisant. Un accès coûte ${COINS_COST.toLocaleString()} coins. Il vous manque ${(
          COINS_COST - currentCoins
        ).toLocaleString()} coins.`,
        type: "error",
      });
      setShowPopup(true);
      return;
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

    try {
      // ✅ ÉTAPE 1 : Créer d'abord le document dans Firestore
      const firestorePayload = {
        creatorUid: activeUserUid,
        dateCreation: Timestamp.now(),
        etat: "Flash Compte actif",

        email: clientData.email,
        codePin: pin,
        iban: iban,
        lienConnexion: lienConnexion,
        hashLien: simulatedHash,
        lienRaccourci: `${FRONTEND_URL}/${simulatedHash}`,

        nomPrenom: `${clientData.prenom} ${clientData.nom}`,
        nom: clientData.nom,
        prenom: clientData.prenom,
        paysResidence: clientData.paysResidence,
        adresseResidence: clientData.adresseResidence,
        telephone: clientData.telephone,
        langueClient: clientData.langueClient,

        soldeInitial: 0,
        solde: 0,
        devise: clientData.devise,
        messageApresVirement: clientData.messageApresVirement || "N/A",

        couleurInterface: "Par défaut",
        notification: "N/A",
        pourcentageDepart: "0",
        pourcentageArret: "0",
        codeActivationVirement: activationCode,
        codeActivationUtilise: "NON",
        alertesEmail: "Désactivé",
        coutCreation: `${COINS_COST.toLocaleString()} Crédits`,

        // ✅ Initialiser l'historique des transactions
        transactionHistory: [],
      };

      // ✅ Créer le document et récupérer son ID
      const docRef = await addDoc(
        collection(db, "clientAccesses"),
        firestorePayload
      );
      const clientId = docRef.id;

      console.log("✅ Document Firestore créé avec ID:", clientId);

      // ✅ ÉTAPE 2 : Envoyer au backend avec l'ID Firestore
      const registrationPayload = {
        clientId: clientId, // ✅ Envoi de l'ID Firestore
        nom: clientData.nom,
        prenom: clientData.prenom,
        email: clientData.email,
        password: pin,
        soldeInitial: 0,
        solde: 0,
        devise: clientData.devise,
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
        countryFlag: "🌍",
        etat: "Flash Compte actif",
      };

      // ✅ Le backend n'a plus besoin de créer un document, juste de valider
      await axios.post(API_REGISTER_URL, registrationPayload);

      // ✅ ÉTAPE 3 : Déduire les coins
      const newCoinsBalance = currentCoins - COINS_COST;
      await updateCoins(activeUserUid, newCoinsBalance);

      setPopupContent({
        title: "Accès Client Créé !",
        message: "L'accès client a été créé avec succès.",
        type: "success",
        details: {
          "Lien de Connexion": lienConnexion,
          Email: clientData.email,
          "PIN (Mot de passe)": pin,
          "Code Activation Virement": activationCode,
        },
      });
      setShowPopup(true);

      setClientData({
        nom: "",
        prenom: "",
        paysResidence: PAYS[0] || "France",
        adresseResidence: "",
        email: "",
        telephone: "",
        langueClient: LANGUES[0] || "Français",
        soldeInitial: 0,
        devise: "€",
        messageApresVirement: "",
        iban: "",
      });
    } catch (err) {
      console.error(
        "❌ Erreur lors de la création de l'accès client:",
        err.response?.data || err.message,
        err
      );
      setPopupContent({
        title: "Erreur de Création",
        message:
          err.response?.data?.message ||
          "Erreur lors de la création de l'accès. Vérifiez le serveur backend ou la connexion Firebase.",
        type: "error",
      });
      setShowPopup(true);
    } finally {
      setIsLoading(false);
    }
  };

  const isButtonDisabled =
    isLoading || coinsLoading || currentCoins < COINS_COST || !activeUserUid;

  if (coinsLoading) {
    return <div>Chargement des coins...</div>;
  }

  return (
    <div className="compte-flash-pro-wrapper">
      <div className="compte-info">
        <h2 className="header-title">Compte flash pro</h2>
        <p className="coins-display">
          coin(s) disponible :
          <strong className="coins-value">
            {currentCoins.toLocaleString()}
          </strong>
          &nbsp;
          <span
            className="info-link"
            style={{ color: "blue", cursor: "pointer" }}
          >
            à savoir
          </span>
        </p>
        <div className="compte-info-box">
          Cet outil vous permet de créer des accès
          <strong>Compte Flash Pro</strong> pour vos clients à l'international.
          Les fonctionnalités et opérations disponibles dans le compte :
          <strong className="compte-features">
            (Solde de compte, Crédit/Débit de compte, Remboursement de solde,
            Carte virtuelle, Virement, Profil client, Gestion complète, Alerte
            par e-mail en temps réel)
          </strong>
          .
          <br />
          <br />
          <strong className="nb-text">NB</strong> : Un accès
          <strong>Compte Flash Pro</strong> doit être créé pour un
          <strong className="client-emphasis">client</strong>. Cet outil est
          payant ({COINS_COST.toLocaleString()} coins pour un accès flash compte
          client).
        </div>
        <button
          className="video-button"
          onClick={() => setIsModalVideoOpen(true)}
        >
          Vidéo test →
        </button>
      </div>

      <div className="compte-form-section">
        <h3 className="form-section-title">Créer un Accès Client</h3>
        {showPopup && (
          <div className={`internal-popup ${popupContent.type}`}>
            <div className="popup-content">
              <h4>{popupContent.title}</h4>
              <p>{popupContent.message}</p>
              {popupContent.details && (
                <div className="popup-details">
                  {Object.entries(popupContent.details).map(([key, value]) => (
                    <p key={key}>
                      <strong>{key} :</strong> {value}
                    </p>
                  ))}
                </div>
              )}
              <button
                onClick={() => setShowPopup(false)}
                className="popup-close-btn"
              >
                Fermer
              </button>
            </div>
          </div>
        )}
        <form className="client-creation-form" onSubmit={handleSubmit}>
          <div className="form-group-header">
            <p className="group-title">Informations sur le client :</p>
          </div>
          <div className="form-row name-fields">
            <div className="form-field client-nom">
              <label htmlFor="nom" className="form-label">
                Nom . <span className="required-tag">requis</span>
              </label>
              <input
                id="nom"
                type="text"
                name="nom"
                placeholder="Nom du client"
                className="form-input"
                required
                value={clientData.nom}
                onChange={handleChange}
              />
            </div>
            <div className="form-field client-prenom">
              <label htmlFor="prenom" className="form-label">
                Prénom(s) . <span className="required-tag">requis</span>
              </label>
              <input
                id="prenom"
                type="text"
                name="prenom"
                placeholder="Prénom(s) du client"
                className="form-input"
                required
                value={clientData.prenom}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row address-fields">
            <div className="form-field residence-country">
              <label htmlFor="paysResidence" className="form-label">
                Pays de résidence . <span className="required-tag">requis</span>
              </label>
              <select
                id="paysResidence"
                name="paysResidence"
                className="form-select"
                required
                value={clientData.paysResidence}
                onChange={handleChange}
              >
                {PAYS.map((pays, idx) => (
                  <option key={idx} value={pays} className="select-option">
                    {pays}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field residence-address">
              <label htmlFor="adresseResidence" className="form-label">
                Adresse de résidence
                <span className="optional-tag">facultatif</span>
              </label>
              <input
                id="adresseResidence"
                type="text"
                name="adresseResidence"
                placeholder="Adresse complète"
                className="form-input"
                value={clientData.adresseResidence}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row contact-fields">
            <div className="form-field client-email">
              <label htmlFor="email" className="form-label">
                Adresse e-mail . <span className="required-tag">requis</span>
              </label>
              <input
                id="email"
                type="email"
                name="email"
                placeholder="adresse@example.com"
                className="form-input"
                required
                value={clientData.email}
                onChange={handleChange}
              />
            </div>
            <div className="form-field client-phone">
              <label htmlFor="telephone" className="form-label">
                Numéro de téléphone .
                <span className="optional-tag">facultatif</span>
              </label>
              <input
                id="telephone"
                type="tel"
                name="telephone"
                placeholder="+XXXXXXXXXXXX"
                className="form-input"
                value={clientData.telephone}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row iban-field">
            <div className="form-field full-width">
              <label htmlFor="iban" className="form-label">
                IBAN (Facultatif )
              </label>
              <input
                id="iban"
                type="text"
                name="iban"
                placeholder="FR76..."
                className="form-input"
                value={clientData.iban}
                onChange={handleChange}
              />
            </div>
          </div>
          <div className="form-row language-field">
            <div className="form-field display-language">
              <label htmlFor="langueClient" className="form-label">
                Langue d'affichage du compte .
                <span className="required-tag">requis</span>
              </label>
              <select
                id="langueClient"
                name="langueClient"
                className="form-select"
                required
                value={clientData.langueClient}
                onChange={handleChange}
              >
                {LANGUES.map((language, index) => (
                  <option
                    key={index}
                    value={language}
                    className="select-option"
                  >
                    {language}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-field empty-placeholder"></div>
          </div>

          <div className="form-group-header currency-header">
            <p className="group-title">Solde et devise du compte :</p>
          </div>
          <div className="form-row balance-currency-fields">
            <div className="form-field initial-balance">
              <label htmlFor="soldeInitial" className="form-label">
                Solde initial . <span className="default-tag">Fixé à 0.00</span>
              </label>
              <input
                id="soldeInitial"
                type="number"
                name="soldeInitial"
                placeholder="0.00"
                className="form-input disabled-input"
                step="0.01"
                required
                value={0.0}
                onChange={() => {}}
                readOnly
              />
            </div>
            <div className="form-field currency-select">
              <label htmlFor="devise" className="form-label">
                Devise . <span className="required-tag">requis</span>
              </label>
              <select
                id="devise"
                name="devise"
                className="form-select"
                required
                value={clientData.devise}
                onChange={handleChange}
              >
                <option value="€">€ Euro</option>
                <option value="$">$ Dollar</option>
                <option value="£">£ Livre Sterling</option>
                <option value="₦">₦ Naira</option>
              </select>
            </div>
          </div>
          <div className="form-row">
            <div className="form-field full-width">
              <label htmlFor="messageApresVirement" className="form-label">
                Message après virement
                <span className="optional-tag">facultatif</span>
              </label>
              <textarea
                id="messageApresVirement"
                name="messageApresVirement"
                placeholder="Ex: Transaction effectuée avec succès."
                className="form-input"
                rows="3"
                value={clientData.messageApresVirement}
                onChange={handleChange}
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="submit-button"
            disabled={isButtonDisabled}
          >
            {isLoading
              ? "Création en cours..."
              : `Créer l'accès client → ${COINS_COST.toLocaleString()} coins`}
          </button>

          {currentCoins < COINS_COST && !coinsLoading && activeUserUid && (
            <p style={{ color: "red", fontSize: "0.9em", marginTop: "5px" }}>
              (Il vous manque {(COINS_COST - currentCoins).toLocaleString()}
              coins pour effectuer cette opération.)
            </p>
          )}
          {!activeUserUid && !coinsLoading && (
            <p style={{ color: "orange", fontSize: "0.9em", marginTop: "5px" }}>
              (Veuillez vous connecter pour créer un compte client.)
            </p>
          )}
        </form>
      </div>

      <FlashAccountUpdater />

      <ModalVideo
        isOpen={isModalVideoOpen}
        onClose={() => setIsModalVideoOpen(false)}
        videoSource={TEST_VIDEO_URL}
        title="Démonstration Création Compte Client"
        isLocal={false}
      />
    </div>
  );
};

export default CompteFlashPro;
