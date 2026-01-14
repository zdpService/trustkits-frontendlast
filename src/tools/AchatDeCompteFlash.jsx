import React, { useState, useContext, useEffect } from "react"; // Ajout de useEffect
import { BANQUES, PAYS } from "../data/tableau des banque/data";
import "./AchatDeCompteFlash.css";
import { CoinsContext } from "../context/CoinsContext";
import { auth, db } from "../firebase/config";
import { collection, addDoc, Timestamp, doc, getDoc } from "firebase/firestore"; // Ajout de doc, getDoc
import { Plus, Trash2, Lock } from "lucide-react"; // Ajout de Lock
import { languagesAchat } from "../data/clientData";

const TYPES_COMPTE = ["Compte Courant", "Compte Épargne", "Compte Bloqué"];

const SOUS_TYPES_COMPTE = [
  "Compte Simple",
  "Compte avec lancement de virement",
];

// Prix par défaut (si l'admin n'a rien défini)
const DEFAULT_COINS_COST = 5000;

const URL_LOCAL = "http://localhost:3001";
const URL_VERCEL = "https://online-bank-app.vercel.app";
const APP2_URL =
  window.location.hostname === "localhost" ? URL_LOCAL : URL_VERCEL;

const MOTIFS_LIST = [
  "Facture",
  "Loyer",
  "Services",
  "Achat",
  "Remboursement",
  "Salaire",
  "Donation",
  "Dons",
  "Aide familiale",
  "Investissement",
  "Voyage",
  "Prêt personnel",
  "Frais médicaux",
  "Frais d’étude",
  "Achat véhicule",
  "Frais de réparation",
  "Cadeau",
  "Cotisation",
  "Abonnement",
  "Autre",
  "Assurance",
  "Impôts",
];

const TRANSACTION_TYPES = [
  {
    label: "Réception de virement",
    category: "Deposit",
    type: "income",
    icon: "download",
    fields: ["merchant", "iban", "bic", "libelle"],
  },
  {
    label: "Virement émis",
    category: "Transfer",
    type: "payment",
    icon: "upload",
    fields: ["merchant", "iban", "bic", "libelle"],
  },
  {
    label: "Paiement Carte",
    category: "Entertainment",
    type: "payment",
    icon: "credit-card",
    fields: ["merchant", "location", "category_detail"],
  },
  {
    label: "Salaire",
    category: "Salary",
    type: "income",
    icon: "briefcase",
    fields: ["merchant"],
  },
  {
    label: "Retrait DAB",
    category: "Cash",
    type: "payment",
    icon: "banknote",
    fields: ["location"],
  },
];

const generateRandomIban = (countryCode = "FR") => {
  const randomDigits = Math.floor(
    10000000000000000000 + Math.random() * 90000000000000000000
  )
    .toString()
    .substring(0, 23);
  const code =
    countryCode && countryCode.length >= 2
      ? countryCode.substring(0, 2).toUpperCase()
      : "FR";
  return `${code}76${randomDigits}`;
};

const generatePin = () =>
  Math.floor(100000 + Math.random() * 900000).toString();
const generateId = () =>
  Math.floor(1000000000 + Math.random() * 9000000000).toString();

const PopupModal = ({ isOpen, content, onClose }) => {
  if (!isOpen) return null;
  return (
    <div className={`internal-popup ${content.type}`}>
      <div className="popup-overlay" onClick={onClose}></div>
      <div className="popup-content">
        <div className={`popup-icon ${content.type}`}>
          {content.type === "success" ? "✓" : "!"}
        </div>
        <h4>{content.title}</h4>
        <p>{content.message}</p>
        {content.details && (
          <div className="popup-details">
            {Object.entries(content.details).map(([key, value]) => (
              <div className="detail-row" key={key}>
                <span className="detail-key">{key}:</span>
                {key.toLowerCase().includes("lien") ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="detail-link"
                  >
                    Ouvrir le lien
                  </a>
                ) : (
                  <span className="detail-value">{value}</span>
                )}
              </div>
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

const AchatDeCompteFlash = () => {
  const {
    coins,
    updateCoins,
    loading: coinsLoading,
    userUid,
  } = useContext(CoinsContext);

  // --- NOUVEAUX ÉTATS POUR LA PERSONNALISATION ---
  const [actualCost, setActualCost] = useState(DEFAULT_COINS_COST);
  const [isAllowed, setIsAllowed] = useState(true);
  const [settingsLoading, setSettingsLoading] = useState(true);

  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    adresse: "",
    nomBanque: BANQUES[0],
    autreBanque: "",
    typeCompte: TYPES_COMPTE[0],
    sousTypeCompte: SOUS_TYPES_COMPTE[0],
    soldeCompte: "",
    fraisDeblocage: "",
    devise: "€",
    language: "Français",
    pays: PAYS[0] || "France",
    ville: "",
    iban: "",
  });

  const [transactions, setTransactions] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [popupContent, setPopupContent] = useState({
    title: "",
    message: "",
    details: null,
    type: "info",
  });
  const [isLoading, setIsLoading] = useState(false);

  const currentCoins = coins || 0;
  const activeUserUid = userUid || auth.currentUser?.uid;

  // --- EFFET POUR RÉCUPÉRER LE COÛT PERSONNALISÉ ---
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
          const data = userSnap.data();
          // On cherche la clé "achat_compte_flash" définie dans l'admin
          const serviceConfig = data.serviceSettings?.achat_compte_flash;

          if (serviceConfig) {
            // 1. Vérifier si le service est autorisé
            if (serviceConfig.allowed === false) {
              setIsAllowed(false);
            }
            // 2. Vérifier s'il y a un coût personnalisé
            if (serviceConfig.cost !== undefined && serviceConfig.cost !== "") {
              setActualCost(Number(serviceConfig.cost));
            }
          }
        }
      } catch (error) {
        console.error("Erreur chargement settings:", error);
      } finally {
        setSettingsLoading(false);
      }
    };

    fetchServiceSettings();
  }, [activeUserUid]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "typeCompte") {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
        sousTypeCompte:
          value === "Compte Courant" ? prev.sousTypeCompte : "Compte Simple",
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const addTransaction = () => {
    setTransactions([
      ...transactions,
      {
        id: Date.now(),
        typeObj: TRANSACTION_TYPES[0],
        amount: "",
        date: new Date().toISOString().split("T")[0],
        merchant: "",
        iban: "",
        bic: "",
        libelle: "",
        location: "",
      },
    ]);
  };

  const updateTransaction = (id, field, value) => {
    setTransactions(
      transactions.map((tx) => {
        if (tx.id === id) {
          if (field === "typeObj") {
            const newType = TRANSACTION_TYPES.find((t) => t.label === value);
            return {
              ...tx,
              typeObj: newType,
              merchant: "",
              iban: "",
              bic: "",
              libelle: "",
              location: "",
            };
          }
          return { ...tx, [field]: value };
        }
        return tx;
      })
    );
  };

  const removeTransaction = (id) =>
    setTransactions(transactions.filter((tx) => tx.id !== id));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Vérification blocage Admin
    if (!isAllowed)
      return showErrorPopup(
        "Accès Refusé",
        "Ce service n'est pas disponible pour votre compte."
      );

    if (!activeUserUid)
      return showErrorPopup("Auth", "Veuillez vous reconnecter.");
    if (!formData.nom || !formData.prenom || !formData.soldeCompte)
      return showErrorPopup("Erreur", "Champs obligatoires manquants.");

    // Utilisation de actualCost au lieu de la constante
    if (currentCoins < actualCost)
      return showErrorPopup(
        "Solde Insuffisant",
        `Manque ${(actualCost - currentCoins).toLocaleString()} coins.`
      );

    setIsLoading(true);

    const banqueFinale =
      formData.nomBanque === "Autre (Saisir manuellement)"
        ? formData.autreBanque
        : formData.nomBanque;
    const ibanFinal =
      formData.iban ||
      generateRandomIban(formData.pays ? formData.pays.substring(0, 2) : "FR");
    const generatedPin = generatePin();
    const generatedId = generateId();
    const lienConnexion = `${APP2_URL}/?id=${generatedId}`;
    const finalSousType =
      formData.typeCompte === "Compte Courant"
        ? formData.sousTypeCompte
        : "Compte Simple";

    try {
      const formattedTransactions = transactions.map((tx) => ({
        label: tx.typeObj.label,
        amount: tx.amount,
        date: tx.date,
        type: tx.typeObj.type,
        category: tx.typeObj.category,
        icon: tx.typeObj.icon,
        ...(tx.merchant && { merchant: tx.merchant }),
        ...(tx.iban && { iban: tx.iban }),
        ...(tx.bic && { bic: tx.bic }),
        ...(tx.libelle && { libelle: tx.libelle }),
        ...(tx.location && { location: tx.location }),
      }));

      const purchaseData = {
        creatorUid: activeUserUid,
        dateAchat: Timestamp.now(),
        typeItem: "Achat Compte Flash",
        status: "Livré",
        detailsCompte: {
          ...formData,
          sousTypeCompte: finalSousType,
          banque: banqueFinale,
          iban: ibanFinal,
          fraisDeblocage: formData.fraisDeblocage || "0",
          identifiant: generatedId,
          codePin: generatedPin,
          lienConnexion: lienConnexion,
          transactions: formattedTransactions,
        },
        cout: actualCost, // On enregistre le coût réel payé
      };

      await addDoc(collection(db, "purchasedAccounts"), purchaseData);

      // Déduction du coût dynamique
      await updateCoins(activeUserUid, currentCoins - actualCost);

      showSuccessPopup("Compte Créé !", "Accès client :", {
        Banque: banqueFinale,
        Solde: `${formData.soldeCompte} ${formData.devise}`,
        Langue: formData.language,
        "Identifiant (ID)": generatedId,
        "Code PIN": generatedPin,
        Lien: lienConnexion,
      });

      setFormData((prev) => ({
        ...prev,
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        adresse: "",
        soldeCompte: "",
        fraisDeblocage: "",
        ville: "",
        iban: "",
      }));
      setTransactions([]);
    } catch (error) {
      console.error(error);
      showErrorPopup("Erreur", "Problème lors de la sauvegarde.");
    } finally {
      setIsLoading(false);
    }
  };

  const showSuccessPopup = (title, message, details) => {
    setPopupContent({ title, message, details, type: "success" });
    setShowPopup(true);
  };
  const showErrorPopup = (title, message) => {
    setPopupContent({ title, message, details: null, type: "error" });
    setShowPopup(true);
  };

  // --- RENDU SI SERVICE BLOQUÉ ---
  if (!settingsLoading && !isAllowed) {
    return (
      <div
        className="acf-container"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "60vh",
        }}
      >
        <div
          style={{
            textAlign: "center",
            background: "white",
            padding: "40px",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          }}
        >
          <Lock size={48} color="#dc2626" style={{ marginBottom: "16px" }} />
          <h2 style={{ color: "#1f2937", marginBottom: "8px" }}>
            Service Non Disponible
          </h2>
          <p style={{ color: "#6b7280" }}>
            L'accès à ce générateur a été restreint pour votre compte.
          </p>
          <p style={{ color: "#6b7280", fontSize: "13px" }}>
            Veuillez contacter le support pour plus d'informations.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="acf-container">
      <PopupModal
        isOpen={showPopup}
        content={popupContent}
        onClose={() => setShowPopup(false)}
      />

      <div className="acf-header">
        <div className="acf-header-content">
          <h2>Achat Compte Flash</h2>
          <p>Générez un accès client complet.</p>
        </div>
        <div className="acf-coins-badge">
          <span>Solde:</span> <strong>{currentCoins.toLocaleString()} </strong>
        </div>
      </div>

      <div className="acf-card">
        <form onSubmit={handleSubmit}>
          {/* ... (SECTIONS 01, 02, 03 SONT IDENTIQUES À AVANT, JE LES GARDE) ... */}

          {/* SECTION 01 & 02 (Identique) */}
          <div className="acf-section-title">
            <span>01</span> Configuration Bancaire
          </div>
          <div className="acf-grid">
            <div className="acf-input-group full">
              <label>Banque</label>
              <select
                name="nomBanque"
                value={formData.nomBanque}
                onChange={handleChange}
              >
                {BANQUES.map((b, i) => (
                  <option key={i} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>
            {formData.nomBanque.includes("Autre") && (
              <div className="acf-input-group full">
                <input
                  type="text"
                  name="autreBanque"
                  placeholder="Nom de la banque..."
                  value={formData.autreBanque}
                  onChange={handleChange}
                />
              </div>
            )}
            <div className="acf-input-group">
              <label>Type de Compte</label>
              <select
                name="typeCompte"
                value={formData.typeCompte}
                onChange={handleChange}
              >
                {TYPES_COMPTE.map((t, i) => (
                  <option key={i} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            {formData.typeCompte === "Compte Courant" && (
              <div className="acf-input-group">
                <label>Option du Compte</label>
                <select
                  name="sousTypeCompte"
                  value={formData.sousTypeCompte}
                  onChange={handleChange}
                >
                  {SOUS_TYPES_COMPTE.map((t, i) => (
                    <option key={i} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
            )}
            <div className="acf-input-group">
              <label>IBAN (Optionnel)</label>
              <input
                type="text"
                name="iban"
                placeholder="Généré auto si vide"
                value={formData.iban}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="acf-section-title">
            <span>02</span> Identité du Titulaire
          </div>
          <div className="acf-grid">
            <div className="acf-input-group">
              <label>Nom</label>
              <input
                type="text"
                name="nom"
                required
                value={formData.nom}
                onChange={handleChange}
              />
            </div>
            <div className="acf-input-group">
              <label>Prénom</label>
              <input
                type="text"
                name="prenom"
                required
                value={formData.prenom}
                onChange={handleChange}
              />
            </div>
            <div className="acf-input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="client@mail.com"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div className="acf-input-group">
              <label>Téléphone</label>
              <input
                type="tel"
                name="telephone"
                placeholder="+33 6 ..."
                value={formData.telephone}
                onChange={handleChange}
              />
            </div>
            <div className="acf-input-group full">
              <label>Adresse Complète</label>
              <input
                type="text"
                name="adresse"
                placeholder="10 Rue de la Paix..."
                value={formData.adresse}
                onChange={handleChange}
              />
            </div>
            <div className="acf-input-group">
              <label>Pays</label>
              <select name="pays" value={formData.pays} onChange={handleChange}>
                {PAYS.map((p, i) => (
                  <option key={i} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="acf-input-group">
              <label>Ville</label>
              <input
                type="text"
                name="ville"
                placeholder="Ex: Paris"
                value={formData.ville}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="acf-section-title">
            <span>03</span> Détails Financiers
          </div>
          <div className="acf-grid">
            <div className="acf-input-group">
              <label>Langue d'affichage</label>
              <select
                name="language"
                value={formData.language}
                onChange={handleChange}
              >
                {languagesAchat.map((lang, i) => (
                  <option key={i} value={lang}>
                    {lang}
                  </option>
                ))}
              </select>
            </div>
            <div className="acf-input-group">
              <label>Devise</label>
              <select
                name="devise"
                value={formData.devise}
                onChange={handleChange}
              >
                <option value="€">EUR (€)</option>
                <option value="$">USD ($)</option>
                <option value="£">GBP (£)</option>
                <option value="CHF">CHF</option>
                <option value="XOF">CFA</option>
              </select>
            </div>
            <div className="acf-input-group">
              <label>Solde</label>
              <input
                type="number"
                name="soldeCompte"
                placeholder="0.00"
                required
                value={formData.soldeCompte}
                onChange={handleChange}
                className="input-money"
              />
            </div>
            <div className="acf-input-group">
              <label>Frais Déblocage</label>
              <input
                type="number"
                name="fraisDeblocage"
                placeholder="Ex: 500"
                value={formData.fraisDeblocage}
                onChange={handleChange}
                className="input-money warning"
              />
            </div>
          </div>

          {/* --- SECTION 04 : TRANSACTIONS --- */}
          <div
            className="acf-section-title"
            style={{
              marginTop: "30px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <span>04</span> Historique Transactions
            </div>
            <button
              type="button"
              onClick={addTransaction}
              className="btn-add-tx"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>

          {transactions.length === 0 ? (
            <div className="no-transactions">
              Aucune transaction ajoutée (historique vide).
            </div>
          ) : (
            <div className="transactions-editor-list">
              {transactions.map((tx, index) => (
                <div key={tx.id} className="tx-edit-card">
                  <div className="tx-edit-header">
                    <span className="tx-index">Transaction #{index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeTransaction(tx.id)}
                      className="btn-remove-tx"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="tx-edit-body">
                    <div className="tx-row-basic">
                      <div className="tx-group">
                        <label>Type de transaction</label>
                        <select
                          value={tx.typeObj.label}
                          onChange={(e) =>
                            updateTransaction(tx.id, "typeObj", e.target.value)
                          }
                        >
                          {TRANSACTION_TYPES.map((t, i) => (
                            <option key={i} value={t.label}>
                              {t.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="tx-group">
                        <label>Montant</label>
                        <input
                          type="number"
                          placeholder="ex: 500"
                          value={tx.amount}
                          onChange={(e) =>
                            updateTransaction(tx.id, "amount", e.target.value)
                          }
                        />
                      </div>
                      <div className="tx-group">
                        <label>Date</label>
                        <input
                          type="date"
                          value={tx.date}
                          onChange={(e) =>
                            updateTransaction(tx.id, "date", e.target.value)
                          }
                        />
                      </div>
                    </div>
                    <div className="tx-row-dynamic">
                      {(tx.typeObj.fields.includes("merchant") ||
                        tx.typeObj.fields.includes("iban")) && (
                        <div className="tx-group full">
                          <label>
                            Nom{" "}
                            {tx.typeObj.type === "income"
                              ? "Émetteur"
                              : "Bénéficiaire"}
                          </label>
                          <input
                            type="text"
                            placeholder="ex: Amazon, Paul Dupont..."
                            value={tx.merchant}
                            onChange={(e) =>
                              updateTransaction(
                                tx.id,
                                "merchant",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      {tx.typeObj.fields.includes("iban") && (
                        <>
                          <div className="tx-group">
                            <label>IBAN</label>
                            <input
                              type="text"
                              placeholder="FR76..."
                              value={tx.iban}
                              onChange={(e) =>
                                updateTransaction(tx.id, "iban", e.target.value)
                              }
                            />
                          </div>
                          <div className="tx-group">
                            <label>BIC</label>
                            <input
                              type="text"
                              placeholder="ABCD..."
                              value={tx.bic}
                              onChange={(e) =>
                                updateTransaction(tx.id, "bic", e.target.value)
                              }
                            />
                          </div>
                        </>
                      )}
                      {tx.typeObj.fields.includes("location") && (
                        <div className="tx-group">
                          <label>Lieu / Ville</label>
                          <input
                            type="text"
                            placeholder="ex: Paris..."
                            value={tx.location}
                            onChange={(e) =>
                              updateTransaction(
                                tx.id,
                                "location",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      )}
                      {tx.typeObj.fields.includes("libelle") && (
                        <div className="tx-group full">
                          <label>Libellé / Motif</label>
                          {tx.typeObj.category === "Transfer" ||
                          tx.typeObj.category === "Deposit" ? (
                            <select
                              value={tx.libelle}
                              onChange={(e) =>
                                updateTransaction(
                                  tx.id,
                                  "libelle",
                                  e.target.value
                                )
                              }
                            >
                              <option value="">-- Choisir un motif --</option>
                              {MOTIFS_LIST.map((motif, idx) => (
                                <option key={idx} value={motif}>
                                  {motif}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type="text"
                              placeholder="ex: Remboursement..."
                              value={tx.libelle}
                              onChange={(e) =>
                                updateTransaction(
                                  tx.id,
                                  "libelle",
                                  e.target.value
                                )
                              }
                            />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="acf-footer">
            <div className="cost-info">
              {/* Affichage du Coût Dynamique */}
              Coût : <span>{actualCost.toLocaleString()} Coins</span>
            </div>
            <button
              type="submit"
              className="acf-btn-submit"
              disabled={isLoading || coinsLoading || settingsLoading}
            >
              {isLoading ? "Création..." : "Générer le Compte"}
            </button>
          </div>
          {currentCoins < actualCost && (
            <div className="error-banner">
              Solde insuffisant (Requis: {actualCost}).
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

export default AchatDeCompteFlash;
