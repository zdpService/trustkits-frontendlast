import React, { useEffect, useState, useContext } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { CoinsContext } from "../context/CoinsContext";
import { auth, db } from "../firebase/config";
import { collection, addDoc } from "firebase/firestore";
import "./PaymentStatus.css";
import Loading from "../utilities/laoding/Loading";
import AccountLayout from "../layout/AccountLayout";

const PaymentStatus = () => {
  const { loadCoins } = useContext(CoinsContext);
  const [statusMessage, setStatusMessage] = useState(
    "Vérification de l'état du paiement..."
  );
  const [statusType, setStatusType] = useState("loading");
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const queryParams = new URLSearchParams(location.search);
    const token = queryParams.get("token");

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        if (token) {
          verifyPayment(token, user.uid);
        } else {
          setStatusType("error");
          setStatusMessage("❌ Erreur: Jeton de paiement manquant.");
        }
      } else {
        setStatusType("error");
        setStatusMessage(
          "❌ Erreur: Utilisateur non connecté. Veuillez vous reconnecter."
        );
      }
    });

    return () => unsubscribe();
  }, [location]);

  const verifyPayment = async (token, uid) => {
    try {
      const response = await axios.get(
        `https://trust-kits-backend.onrender.com/api/check-payment-status?token=${token}`
      );
      const paymentStatus = response.data;
      const transactionData = paymentStatus.data;
      if (paymentStatus.statut && transactionData.statut === "paid") {
        const coinsGained = transactionData.personal_Info?.[0]?.packCoins || 0;
        let rawAmount =
          transactionData.packAmount ||
          transactionData.amount ||
          transactionData.amount_HT ||
          0;
        rawAmount = Number(rawAmount);

        const now = new Date();
        const transactionRef = transactionData.transaction_ref || "N/A";
        const formattedPackAmount =
          rawAmount > 0
            ? `${rawAmount.toLocaleString("fr-FR")} F CFA`
            : "Montant Indéfini";

        const historyRef = collection(db, "paiements", uid, "history");
        await addDoc(historyRef, {
          amount: rawAmount,
          credits: coinsGained,
          pack: formattedPackAmount,
          date: now.toLocaleDateString("fr-FR"),
          time: now.toLocaleTimeString("fr-FR", { hour12: false }),
          validBy: "FusionPay",
          transactionId: transactionRef,
          statut: "paid",
        });

        await loadCoins(uid);

        setStatusType("success");
        setStatusMessage(
          <div className="success-message">
            <svg
              className="animated-check"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
            >
              <path
                className="check-path"
                fill="none"
                stroke="#1ab74b"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M4.5 12.75l6 6 9-13.5"
              />
            </svg>
            <span>
              Paiement réussi ! {coinsGained} Coins ajoutés à votre compte.
            </span>
          </div>
        );
      } else if (transactionData.statut === "pending") {
        setStatusType("pending");
        setStatusMessage(
          "⏳ Paiement en attente. Veuillez patienter ou vérifier votre application mobile."
        );
      } else {
        setStatusType("error");
        setStatusMessage(
          `❌ Paiement échoué ou annulé. Message: ${
            paymentStatus.message || "Transaction non complétée."
          }`
        );
      }
    } catch (error) {
      console.error("Erreur:", error.response?.data || error.message);
      setStatusType("error");
      setStatusMessage(
        "⚠️ Erreur de communication avec le serveur ou la base de données."
      );
    }
  };

  return (
    <AccountLayout>
      {" "}
      <div className="payment-container">
        <div className={`payment-card ${statusType}`}>
          <h2>Statut de la transaction</h2>

          {statusType === "loading" ? (
            <div style={{ marginTop: "30px" }}>
              <Loading />
            </div>
          ) : (
            <p className="payment-message">{statusMessage}</p>
          )}

          <button
            className="payment-button"
            onClick={() => navigate("/account")}
          >
            Retour à mon compte
          </button>
        </div>
      </div>
    </AccountLayout>
  );
};

export default PaymentStatus;
