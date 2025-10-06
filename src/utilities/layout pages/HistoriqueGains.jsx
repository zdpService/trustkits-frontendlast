import React, { useEffect, useState } from "react";
import "./HistoriqueGains.css";
import { auth, db } from "../../firebase/config";
import { collection, getDocs } from "firebase/firestore";

const HistoriqueGains = () => {
  const [cashbackMessages, setCashbackMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCashbacks = async () => {
      try {
        if (!auth.currentUser) return;

        const cashbackRef = collection(
          db,
          "users",
          auth.currentUser.uid,
          "cashbacks"
        );
        const snapshot = await getDocs(cashbackRef);

        const messages = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Trier par date décroissante
        messages.sort((a, b) => new Date(b.date) - new Date(a.date));

        setCashbackMessages(messages);
      } catch (error) {
        console.error("Erreur lors du chargement des gains :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCashbacks();
  }, []);

  return (
    <section className="historique-section">
      {/* Header */}
      <div className="header-section">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="header-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
          />
        </svg>
        <span className="header-title">Historique des gains</span>
      </div>

      {/* Liste des gains */}
      <div className="paiement-list">
        {loading ? (
          <p className="loading-message">Chargement des gains...</p>
        ) : cashbackMessages.length === 0 ? (
          <p className="empty-message">
            Aucun gain de cashback pour le moment.
          </p>
        ) : (
          cashbackMessages.map((gain) => (
            <div key={gain.id} className="paiement-item">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                className="paiement-icon"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5"
                />
              </svg>
              <p className="paiement-text">
                {gain.message} <br />{" "}
                <span className="gain-date">
                  {new Date(gain.date).toLocaleString()}
                </span>
              </p>
            </div>
          ))
        )}
      </div>
    </section>
  );
};

export default HistoriqueGains;
