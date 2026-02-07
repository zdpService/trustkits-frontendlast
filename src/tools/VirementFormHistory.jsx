import React, { useEffect, useState } from "react";
import "./VirementFormHistory.css";
import { db } from "../firebase/config";
import {
  collection,
  deleteDoc,
  updateDoc,
  doc,
  Timestamp,
  onSnapshot, // ✅ IMPORTANT : Pour le temps réel
} from "firebase/firestore";
import Loading from "../utilities/laoding/Loading";
import { Clock, MailOpen, Ban, Trash2, XCircle, Send, AlertCircle } from "lucide-react";

const VirementFormHistory = () => {
  const [virements, setVirements] = useState([]);
  const [selectedVirement, setSelectedVirement] = useState(null);
  const [loading, setLoading] = useState(true);

  // Formatage de date court
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

  // ✅ UTILISATION DE onSnapshot AU LIEU DE getDocs
  // Cela permet de voir le statut passer à "Ouvert" instantanément sans rafraîchir
  useEffect(() => {
    setLoading(true);
    
    // Écoute de la collection en temps réel
    const unsubscribe = onSnapshot(collection(db, "virements"), (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })).sort((a, b) => {
        // Tri du plus récent au plus ancien
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

    // Nettoyage de l'écouteur
    return () => unsubscribe();
  }, []);

  const openModal = (virement) => {
    setSelectedVirement(virement);
  };

  const closeModal = () => {
    setSelectedVirement(null);
  };

  // Annuler l'envoi du message
  const handleCancelMessage = async (e, virementId) => {
    e.stopPropagation();
    if (window.confirm("Êtes-vous sûr de vouloir annuler l'envoi de ce message ?")) {
      try {
        const virementRef = doc(db, "virements", virementId);
        await updateDoc(virementRef, {
          statutMessage: "Annulé"
        });
        // Pas besoin de mettre à jour le state manuellement, onSnapshot le fera
      } catch (error) {
        console.error("Erreur lors de l'annulation :", error);
        alert("Impossible d'annuler pour le moment.");
      }
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm("Voulez-vous vraiment supprimer tout l'historique ?")) {
      try {
        // Suppression un par un (Firebase ne permet pas de tout supprimer d'un coup côté client facilement)
        const deletePromises = virements.map(v => deleteDoc(doc(db, "virements", v.id)));
        await Promise.all(deletePromises);
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
            // Récupération du statut MESSAGE
            const statutMsg = v.statutMessage || "En attente";
            
            return (
              <li
                key={v.id}
                onClick={() => openModal(v)}
                className="flasher-virement-item"
              >
                {/* Informations Générales */}
                <div className="flasher-virement-info-main">
                  <strong>{v.beneficiaireNom || v.beneficiaire}</strong>
                  <span className="flasher-virement-amount">{v.montant} {v.devise}</span>
                </div>

                {/* --- SECTION STATUT MESSAGE --- */}
                <div className="flasher-virement-status-section">
                  
                  {/* 1. MESSAGE EN ATTENTE */}
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

                  {/* 2. MESSAGE ENVOYÉ */}
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

                  {/* 3. MESSAGE OUVERT / VU (C'est ici que ça s'affichera automatiquement) */}
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

                  {/* 4. MESSAGE ANNULÉ */}
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

                  {/* 5. ÉCHEC */}
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

      {/* --- MODAL DE DÉTAILS --- */}
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
                
                {/* Statut Virement */}
                <span className={`flasher-status-pill ${
                  selectedVirement.statutVirement === "Effectué" ? "flasher-pill-success" : 
                  selectedVirement.statutVirement === "En cours" ? "flasher-pill-progress" : 
                  selectedVirement.statutVirement === "Rejeté" ? "flasher-pill-rejected" : 
                  "flasher-pill-pending"
                }`}>
                  Virement: {selectedVirement.statutVirement || "En attente"}
                </span>
                
                {/* Statut Message */}
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
                    {/* Affichage de la date d'ouverture si dispo */}
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