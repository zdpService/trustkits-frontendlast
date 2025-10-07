import React, { useState, useContext, useEffect } from "react";
import "./AchatCredits.css";
import { Link } from "react-router-dom";
import { CoinsContext } from "../../context/CoinsContext";
import { auth } from "../../firebase/config";
import axios from "axios";

const packs = [
  // { id: 1, prix: 200, Coins: 30000 },
  { id: 2, prix: 55000, Coins: 5000 },
  { id: 3, prix: 60000, Coins: 10000 },
  { id: 4, prix: 80000, Coins: 20000 },
  { id: 5, prix: 100000, Coins: 30000 },
];

const BACKEND_API_URL =
  "https://trust-kits-backend.onrender.com/api/initiate-fusionpay";

const AchatCredits = () => {
  const [selectedPack, setSelectedPack] = useState(null);
  const { coins } = useContext(CoinsContext);
  const [value, setValue] = useState("");
  const [isPaying, setIsPaying] = useState(false);

  const [userData, setUserData] = useState({
    uid: null,
    nom: "",
    email: "",
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserData({
          uid: user.uid,
          nom: user.displayName || "Utilisateur",
          email: user.email || "",
        });
      }
    });
    return () => unsubscribe();
  }, []);

  const handleChange = (e) => {
    let val = e.target.value.replace(/\D/g, "");
    if (val.length > 4) val = val.slice(0, 4);
    if (val.length > 2) val = val.slice(0, 2) + "/" + val.slice(2);
    setValue(val);
  };

  /**
   * 1. Vérifie le pack sélectionné.
   * 2. Appelle l'endpoint backend pour créer la transaction FusionPay.
   * 3. Redirige l'utilisateur vers l'URL de paiement reçue.
   */
  const handleFusionPay = async () => {
    if (!selectedPack) {
      alert("Veuillez choisir un pack d'abord !");
      return;
    }

    const packDetails = packs.find((p) => p.id === selectedPack);
    if (!packDetails) return;

    setIsPaying(true);

    try {
      // 🚀 Appel à l'endpoint backend
      const response = await axios.post(BACKEND_API_URL, {
        amount: packDetails.prix,
        coins: packDetails.Coins,
        userId: userData.uid, // Envoyé pour identification par le backend
        customerEmail: userData.email,
        customerName: userData.nom,
        // customerPhone: à ajouter si vous collectez le numéro de téléphone.
      });

      const { payment_url } = response.data;

      if (payment_url) {
        // Redirection vers la passerelle de paiement FusionPay
        window.location.href = payment_url;
      } else {
        throw new Error("URL de paiement non reçue de l'API.");
      }
    } catch (error) {
      console.error(
        "Échec de l'initialisation du paiement:",
        error.response?.data || error.message
      );
      alert("Erreur lors de la préparation du paiement. Veuillez réessayer.");
      setIsPaying(false); // Réactiver le bouton en cas d'erreur
    }
  };

  return (
    <section className="achat_section">
      {/* ... (Votre en-tête avec l'icône de panier) ... */}
      <div
        style={{
          padding: "20px",
          background: "#ffffff",
          borderBottom: "1.1px solid rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{
            height: "25px",
            width: "25px",
            color: "#0f172a",
            fontWeight: "bold",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <span style={{ fontWeight: "bold" }}>Achat de coin</span>
      </div>
      {/* ------------------------------------------------------------------ */}
      <div style={{ padding: "20px" }}>
        <div className="solde">
          coin(s) disponible : <span className="valeur">{coins}</span>{" "}
          <Link to="#">à savoir</Link>
        </div>

        <h4>Choisissez un pack de coin :</h4>
        <div className="packs">
          {packs.map((pack) => (
            <div
              key={pack.id}
              className={`pack ${selectedPack === pack.id ? "selected" : ""}`}
              onClick={() => setSelectedPack(pack.id)}
            >
              <p>
                <strong>{pack.prix.toLocaleString()} F CFA</strong>
              </p>
              <p className="bonus">+ {pack.Coins.toLocaleString()} Coins</p>
            </div>
          ))}
        </div>

        <h4>Payer par FusionPay :</h4>
        {/* ------------------------------------------------------ */}
        {/* MISE À JOUR DU BOUTON POUR FUSIONPAY */}
        <button
          className="fedapay_box"
          onClick={handleFusionPay} // 👈 Appelle la fonction de paiement
          disabled={!selectedPack || isPaying} // 👈 Désactiver si pas de pack ou si paiement en cours
        >
          {isPaying ? (
            "Initialisation du paiement..."
          ) : (
            <img
              src="https://www.kitscms.com/res/img/paydunya.png" // REMPLACER par le logo FusionPay si disponible
              alt="FusionPay"
            />
          )}
        </button>
        {/* ------------------------------------------------------ */}

        <div className="ou">OU</div>

        <h4>Payer par Carte bancaire :</h4>
        <div className="cb_form">
          <input type="text" placeholder="Numéro de carte" disabled />
          <input
            type="text"
            placeholder="MM/AA"
            value={value}
            maxLength={5}
            onChange={handleChange}
            style={{ padding: "8px", fontSize: "16px" }}
            disabled
          />
          <input
            type="text"
            placeholder="CVC"
            pattern="\d{2}/\d{2}"
            maxLength="3"
            disabled
          />

          <button className="payer_btn" disabled>
            Payer{" "}
            {selectedPack
              ? packs.find((p) => p.id === selectedPack).prix.toLocaleString()
              : 0}{" "}
            F CFA
          </button>
        </div>
      </div>
    </section>
  );
};

export default AchatCredits;
