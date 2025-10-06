import React, { useEffect, useState } from "react";
import "./PaiementHistory.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";
import Loading from "../laoding/Loading";

const PaiementHistory = () => {
  const [paiementHistory, setPaiementHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // --- LOGIQUE DE VÉRIFICATION DU PAIEMENT DANS L'URL ---
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const status = urlParams.get("payment_status");

    if (status === "success") {
      setPaymentStatus({
        type: "success",
        message:
          "🎉 Félicitations ! Votre achat de coins a été validé avec succès.",
      });
      // Nettoyer l'URL
      window.history.replaceState(null, "", window.location.pathname);
    } else if (status === "failure" || status === "canceled") {
      setPaymentStatus({
        type: "error",
        message:
          "❌ Échec du paiement. Le montant n'a pas été débité. Veuillez réessayer.",
      });
      // Nettoyer l'URL
      window.history.replaceState(null, "", window.location.pathname);
    }
  }, []);
  // --------------------------------------------------------

  // ... (Logique de récupération de l'historique et Loading) ...

  useEffect(() => {
    const fetchPaiements = async (uid) => {
      try {
        const paiementsCollection = collection(db, "paiements", uid, "history");
        const snapshot = await getDocs(paiementsCollection);

        const paiementsData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .sort((a, b) => {
            const dateA = new Date(a.date + " " + a.time);
            const dateB = new Date(b.date + " " + b.time);
            return dateB - dateA;
          });

        setPaiementHistory(paiementsData);
      } catch (error) {
        console.error("Erreur lors de la récupération des paiements :", error);
      } finally {
        setLoading(false);
      }
    };

    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchPaiements(user.uid);
      } else {
        setPaiementHistory([]);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) return <Loading />;

  const closeNotification = () => setPaymentStatus(null);

  return (
    <section className="paiement_history">
      {/* 🚩 Affichage de la Notification après la redirection */}
      {paymentStatus && (
        <div
          className={`notification ${paymentStatus.type}`}
          style={{
            padding: "15px",
            marginBottom: "20px",
            borderRadius: "8px",
            fontWeight: "bold",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            color: paymentStatus.type === "success" ? "#155724" : "#721c24",
            backgroundColor:
              paymentStatus.type === "success" ? "#d4edda" : "#f8d7da",
            border: `1px solid ${
              paymentStatus.type === "success" ? "#c3e6cb" : "#f5c6cb"
            }`,
            margin: "0 20px",
          }}
        >
          {paymentStatus.message}
          <button
            onClick={closeNotification}
            aria-label="Fermer la notification"
            style={{
              background: "none",
              border: "none",
              fontSize: "1.2rem",
              cursor: "pointer",
              fontWeight: "bold",
              color: paymentStatus.type === "success" ? "#155724" : "#721c24",
            }}
          >
            &times;
          </button>
        </div>
      )}

      {/* Reste du contenu (Historique) */}
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
        <span style={{ fontWeight: "bold" }}>
          Historique des paiements ({paiementHistory.length})
        </span>
      </div>

      <div style={{ padding: "20px" }}>
        <div className="paiement_list">
          {paiementHistory.length === 0 ? (
            <p>Aucun paiement effectué..</p>
          ) : (
            paiementHistory.map((item, index) => (
              <div key={item.id || index} className="paiement_item">
                <p>
                  Achat d'un pack coins de <strong>{item.pack}</strong> (
                  <strong>{item.credits} coins</strong>) validé par{" "}
                  <strong>[{item.validBy || "Système"}]</strong> le {item.date}{" "}
                  à {item.time} UTC +0
                </p>
              </div>
            ))
          )}
        </div>

        {/* Bouton de suppression */}
        <div>
          <button
            style={{
              background: "red",
              border: "none",
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#ffffff",
              margin: "0.8rem 0",
              padding: "0.7rem",
              borderRadius: "8px",
              cursor: "pointer",
              gap: "0.3rem",
            }}
            onClick={() => setPaiementHistory([])}
          >
            Supprimer l'historique
          </button>
        </div>
      </div>
    </section>
  );
};

export default PaiementHistory;
