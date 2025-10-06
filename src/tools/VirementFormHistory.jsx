import React, { useEffect, useState } from "react";
import "./VirementFormHistory.css";
import { db } from "../firebase/config";
import {
  collection,
  getDocs,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore";
import Loading from "../utilities/laoding/Loading";

const VirementFormHistory = () => {
  const [virements, setVirements] = useState([]);
  const [selectedVirement, setSelectedVirement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fonction utilitaire pour formater les valeurs
  const formatValue = (value) => {
    if (value instanceof Timestamp) {
      return value.toDate().toLocaleString();
    }
    if (typeof value === "object" && value !== null) {
      return JSON.stringify(value);
    }
    return value;
  };

  // Récupération des virements depuis Firestore
  const fetchVirements = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "virements"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVirements(data);
    } catch (error) {
      console.error("Erreur lors du chargement :", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVirements();
  }, []);

  const openModal = (virement) => {
    setSelectedVirement(virement);
  };

  const closeModal = () => {
    setSelectedVirement(null);
  };

  const handleClearHistory = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer tout l’historique ?")) {
      setLoading(true);
      try {
        for (let virement of virements) {
          await deleteDoc(doc(db, "virements", virement.id));
        }
        setVirements([]);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="virement-history-container">
      <div className="header-section">
        <span className="header-title">Historique des virements</span>
      </div>

      {virements.length === 0 ? (
        <p className="empty-history">Aucun virement enregistré.</p>
      ) : (
        <ul className="virement-list">
          {virements.map((v) => (
            <li
              key={v.id}
              onClick={() => openModal(v)}
              className="virement-item"
            >
              <strong>{v.beneficiaireNom || v.beneficiaire}</strong> -{" "}
              {v.montant} {v.devise} -{" "}
              {v.dateExecution instanceof Timestamp
                ? v.dateExecution.toDate().toLocaleString()
                : v.dateExecution}
            </li>
          ))}
        </ul>
      )}

      {/* Modal */}
      {selectedVirement && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Détails du virement : {selectedVirement.id}</h3>
            <div className="modal-details">
              {Object.entries(selectedVirement).map(([key, value]) => (
                <p key={key}>
                  <strong>{key} :</strong> {formatValue(value)}
                </p>
              ))}
            </div>
            <button className="close-btn" onClick={closeModal}>
              Fermer
            </button>
          </div>
        </div>
      )}

      {virements.length > 0 && (
        <button className="clear-history-btn" onClick={handleClearHistory}>
          🗑 Supprimer l’historique
        </button>
      )}
    </div>
  );
};

export default VirementFormHistory;
