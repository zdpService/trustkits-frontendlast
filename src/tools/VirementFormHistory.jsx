import React, { useEffect, useState } from "react";
import "./VirementFormHistory.css";
import { db } from "../firebase/config";
import {
  collection,
  updateDoc, // 🔴 Remplacement de deleteDoc par updateDoc
  doc,
  Timestamp,
  onSnapshot, 
} from "firebase/firestore";
import Loading from "../utilities/laoding/Loading";
import { Clock, MailOpen, Ban, Trash2, XCircle, Send, AlertCircle } from "lucide-react";

const VirementFormHistory = () => {
  const [virements, setVirements] = useState([]);
  const [selectedVirement, setSelectedVirement] = useState(null);
  const [loading, setLoading] = useState(true);

  const formatShortDate = (timestamp) => {
    if (!timestamp) return "";
    let dateObj;
    if (timestamp instanceof Timestamp) {
      dateObj = timestamp.toDate();
    } else {
      dateObj = new Date(timestamp);
    }
    
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = String(dateObj.getFullYear()).slice(-2);
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');

    return `le ${day}/${month}/${year} à ${hours}:${minutes}`;
  };

  useEffect(() => {
    setLoading(true);
    
    const unsubscribe = onSnapshot(collection(db, "virements"), (snapshot) => {
      const data = snapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        // 🔴 FILTRE MAGIQUE : On cache les documents marqués comme supprimés
        .filter(v => v.masquePourClient !== true)
        .sort((a, b) => {
          const dateA = a.createdAt instanceof Timestamp ? a.createdAt.toMillis() : new Date(a.createdAt).getTime();
          const dateB = b.createdAt instanceof Timestamp ? b.createdAt.toMillis() : new Date(b.createdAt).getTime();
          return dateB - dateA;
        });

      setVirements(data);
      setLoading(false);
    }, (error) => {
      console.error("Erreur temps réel :", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const openModal = (virement) => {
    setSelectedVirement(virement);
  };

  const closeModal = () => {
    setSelectedVirement(null);
  };

  const handleCancelMessage = async (e, virementId) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir annuler l'envoi de ce message ?")) {
      try {
        const virementRef = doc(db, "virements", virementId);
        await updateDoc(virementRef, {
          statutMessage: "Annulé"
        });
      } catch (error) {
        console.error("Erreur lors de l'annulation :", error);
        alert("Impossible d'annuler pour le moment.");
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Voulez-vous vraiment masquer tout l'historique ?")) {
      try {
        // 🔴 SOFT DELETE : On ne détruit plus, on cache. Make pourra toujours les trouver !
        const hidePromises = virements.map(v => 
          updateDoc(doc(db, "virements", v.id), { masquePourClient: true })
        );
        await Promise.all(hidePromises);
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
      }
    }
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="flasher-virement-history-container">
      <div className="flasher-header-section">
        <span className="flasher-header-title">Historique des messages</span>
      </div>

      {virements.length === 0 ? (
        <p className="flasher-empty-history">Aucun message enregistré.</p>
      ) : (
        <ul className="flasher-virement-list">
          {virements.map((v) => {
            const statutMsg = v.statutMessage || "En attente";
            
            return (
              <li
                key={v.id}
                onClick={() => openModal(v)}
                className="flasher-virement-item"
              >
                <div className="flasher-virement-info-main">
                  <strong>{v.beneficiaireNom || v.beneficiaire}</strong>
                  <span className="flasher-virement-amount">{v.montant} {v.devise}</span>
                </div>

                <div className="flasher-virement-status-section">
                  {statutMsg === "En attente" && (
                    <div className="flasher-status-group">
                      <div className="flasher-status-badge flasher-pending">
                        <span>En attente d'envoi</span>
                        <Clock size={14} />
                      </div>
                      <span className="flasher-status-date">
                        Créé {formatShortDate(v.createdAt)}
                      </span>
                      <button 
                        className="flasher-cancel-btn-action" 
                        onClick={(e) => handleCancelMessage(e, v.id)}
                        title="Annuler l'envoi"
                      >
                        Annuler
                      </button>
                    </div>
                  )}

                  {statutMsg === "Envoyé" && (
                    <div className="flasher-status-group">
                      <div className="flasher-status-badge flasher-sent">
                        <span>Message envoyé</span>
                        <Send size={14} />
                      </div>
                      <span className="flasher-status-date">
                        Envoyé {formatShortDate(v.datEnvoi || v.createdAt)}
                      </span>
                    </div>
                  )}

                  {(statutMsg === "Ouvert" || statutMsg === "Vu") && (
                    <div className="flasher-status-group">
                      <div className="flasher-status-badge flasher-opened">
                        <span>Message ouvert</span>
                        <MailOpen size={14} />
                      </div>
                      <span className="flasher-status-date">
                        Lu {formatShortDate(v.openedAt)}
                      </span>
                    </div>
                  )}

                  {statutMsg === "Annulé" && (
                    <div className="flasher-status-group">
                      <div className="flasher-status-badge flasher-cancelled">
                        <span>Message annulé</span>
                        <Ban size={14} />
                      </div>
                      <span className="flasher-status-date">
                        Créé {formatShortDate(v.createdAt)}
                      </span>
                    </div>
                  )}

                  {statutMsg === "Échec d'envoi" && (
                    <div className="flasher-status-group">
                      <div className="flasher-status-badge flasher-failed">
                        <span>Échec d'envoi</span>
                        <AlertCircle size={14} />
                      </div>
                      <span className="flasher-status-date">
                        Créé {formatShortDate(v.createdAt)}
                      </span>
                    </div>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {selectedVirement && (
        <div className="flasher-modal-overlay" onClick={closeModal}>
          <div className="flasher-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="flasher-modal-header">
              <h3>Détails du virement</h3>
              <button className="flasher-close-icon-btn" onClick={closeModal}>
                <XCircle size={24} />
              </button>
            </div>

            <div className="flasher-modal-body">
              <div className="flasher-modal-amount-section">
                <span className="flasher-amount-value">
                  {selectedVirement.montant} {selectedVirement.devise}
                </span>
                
                <span className={`flasher-status-pill ${
                  selectedVirement.statutVirement === "Effectué" ? "flasher-pill-success" : 
                  selectedVirement.statutVirement === "En cours" ? "flasher-pill-progress" : 
                  selectedVirement.statutVirement === "Rejeté" ? "flasher-pill-rejected" : 
                  "flasher-pill-pending"
                }`}>
                  Virement: {selectedVirement.statutVirement || "En attente"}
                </span>
                
                <span className={`flasher-status-pill ${
                  (selectedVirement.statutMessage === "Ouvert" || selectedVirement.statutMessage === "Vu") ? "flasher-pill-opened" : 
                  selectedVirement.statutMessage === "Envoyé" ? "flasher-pill-sent" :
                  selectedVirement.statutMessage === "Annulé" ? "flasher-pill-cancelled" : 
                  selectedVirement.statutMessage === "Échec d'envoi" ? "flasher-pill-failed" :
                  "flasher-pill-pending"
                }`}>
                  Message: {selectedVirement.statutMessage || "En attente"}
                </span>
              </div>

              <div className="flasher-modal-grid">
                <div className="flasher-detail-group">
                  <h4> Bénéficiaire</h4>
                  <div className="flasher-detail-row">
                    <span className="flasher-label">Nom :</span>
                    <span className="flasher-value">{selectedVirement.beneficiaireNom}</span>
                  </div>
                  <div className="flasher-detail-row">
                    <span className="flasher-label">Email :</span>
                    <span className="flasher-value flasher-email-text">{selectedVirement.emailBeneficiaire}</span>
                  </div>
                </div>

                <div className="flasher-detail-group flasher-full-width">
                  <h4> Informations</h4>
                  <div className="flasher-detail-grid-row">
                    <div className="flasher-detail-row">
                      <span className="flasher-label">Référence :</span>
                      <span className="flasher-value">{selectedVirement.reference}</span>
                    </div>
                    {selectedVirement.openedAt && (
                      <div className="flasher-detail-row">
                        <span className="flasher-label">Lu le :</span>
                        <span className="flasher-value">{formatShortDate(selectedVirement.openedAt)}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flasher-modal-footer-id">
                ID: {selectedVirement.id}
              </div>
            </div>

            <div className="flasher-modal-actions">
              <button className="flasher-close-btn-main" onClick={closeModal}>Fermer</button>
            </div>
          </div>
        </div>
      )}

      {virements.length > 0 && (
        <button className="flasher-clear-history-btn" onClick={handleClearHistory}>
          <Trash2 size={16} style={{marginRight: '8px'}}/> Supprimer l'historique
        </button>
      )}
    </div>
  );
};

export default VirementFormHistory;