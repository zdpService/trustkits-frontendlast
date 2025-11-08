import React, { useState, useEffect } from "react";
import { useGiftContext } from "../../context/GiftContext";
import "./UpdateOrderStatus.css";

const UpdateOrderStatus = () => {
  // Assurez-vous d'avoir une fonction `updateOrderStatus` dans votre GiftContext
  const { giftHistory, updateOrderStatus, loading, error } = useGiftContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [updating, setUpdating] = useState(false);

  // Synchroniser l'état local de la commande sélectionnée avec l'historique global
  useEffect(() => {
    if (selectedOrder) {
      const updatedOrder = giftHistory.find(
        (order) => order.id === selectedOrder.id
      );
      if (updatedOrder) {
        setSelectedOrder(updatedOrder);
      }
    }
  }, [giftHistory, selectedOrder]);

  // ✅ Liste des étapes de suivi complètes (y compris celles initiales)
  const fullStatusSteps = [
    "COMMANDE EFFECTUÉE",
    "PAIEMENT CONFIRMÉ", // Étape 2 dans le contexte
    "EN ATTENTE D'EXPÉDITION",
    "EN COURS D'EXPÉDITION",
    "PRÊT À RÉCUPÉRER",
    "COLIS LIVRÉ",
  ];

  const handleSelectOrder = (order) => {
    setSelectedOrder(order);
  };

  // 💡 Corriger les indices et la gestion des étapes
  const handleUpdateStatus = async (stepIndexToComplete) => {
    if (!selectedOrder || updating) return;

    setUpdating(true);

    try {
      const today = new Date();
      // Format de date pour le suivi : DD-MM
      const formattedDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}-${String(today.getMonth() + 1).padStart(2, "0")}`;

      // Récupérer le suivi actuel
      const currentTracking = selectedOrder.tracking || [];

      // La nouvelle liste de suivi est basée sur la liste complète des étapes.
      // Nous utilisons la liste des étapes du contexte (currentTracking) pour les labels
      const newTracking = currentTracking.map((step, index) => {
        // Mettre à jour toutes les étapes jusqu'à l'indice sélectionné (inclus)
        if (index <= stepIndexToComplete) {
          return {
            label: step.label || fullStatusSteps[index],
            completed: true,
            // Conserver la date existante si elle existe, sinon utiliser la date du jour
            date: step.date || formattedDate,
            // Ajouter un message pour l'étape de livraison finale
            message:
              index === 5 && stepIndexToComplete === 5
                ? "Votre cadeau a été livré."
                : step.message || "",
          };
        } else {
          // Réinitialiser les étapes futures
          return {
            label: step.label || fullStatusSteps[index],
            completed: false,
            date: "",
            message: "",
          };
        }
      });

      // Déterminer le nouveau statut principal
      let newStatus = "En préparation";
      if (stepIndexToComplete >= 5) newStatus = "Livré";
      else if (stepIndexToComplete === 4) newStatus = "Prêt pour retrait";
      else if (stepIndexToComplete >= 3) newStatus = "En transit";
      else if (stepIndexToComplete >= 2) newStatus = "En préparation";
      else newStatus = "Validé"; // PAIEMENT CONFIRMÉ (indice 1) est "Validé"

      // Appel à la fonction de mise à jour du contexte
      await updateOrderStatus(selectedOrder.id, newTracking, newStatus);

      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    } catch (error) {
      console.error("Erreur lors de la mise à jour:", error);
      alert("Erreur lors de la mise à jour du statut. Veuillez réessayer.");
    } finally {
      setUpdating(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "Livré":
        return "#10b981";
      case "En transit":
        return "#3b82f6";
      case "Prêt pour retrait":
        return "#6366f1";
      case "Validé":
        return "#f59e0b";
      default:
        return "#6b7280";
    }
  };

  // Fonction pour trouver le dernier index complété
  const getCurrentStepIndex = (tracking) => {
    // Utiliser findLastIndex pour obtenir l'index le plus élevé qui est `completed: true`
    const lastCompletedIndex = tracking.findLastIndex((step) => step.completed);
    return lastCompletedIndex;
  };

  // --- RENDU (inchangé dans sa structure, seule la source de données compte) ---

  if (loading) {
    return (
      <div className="update-status-container">
        <div className="status-header">
          <h1>⚙️ Gestion des Livraisons</h1>
          <p>Mettez à jour le statut de livraison des commandes</p>
        </div>
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Chargement des commandes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="update-status-container">
        <div className="status-header">
          <h1>⚙️ Gestion des Livraisons</h1>
          <p>Mettez à jour le statut de livraison des commandes</p>
        </div>
        <div className="error-state">
          <div className="error-icon">⚠️</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="update-status-container">
      <div className="status-header">
        <h1>⚙️ Gestion des Livraisons</h1>
        <p>Mettez à jour le statut de livraison des commandes</p>
      </div>

      {showSuccess && (
        <div className="success-message">✓ Statut mis à jour avec succès !</div>
      )}

      {updating && (
        <div className="updating-overlay">
          <div className="updating-spinner"></div>
          <p>Mise à jour en cours...</p>
        </div>
      )}

      {giftHistory.length === 0 ? (
        <div className="no-orders">
          <div className="no-orders-icon">📦</div>
          <h3>Aucune commande disponible</h3>
          <p>Il n'y a pas encore de commandes à gérer</p>
        </div>
      ) : (
        <div className="status-layout">
          {/* Liste des commandes */}
          <div className="orders-panel">
            <h2>Commandes ({giftHistory.length})</h2>
            <div className="orders-list">
              {giftHistory.map((order) => (
                <div
                  key={order.id}
                  className={`order-card ${
                    selectedOrder?.id === order.id ? "active" : ""
                  }`}
                  onClick={() => handleSelectOrder(order)}
                >
                  <img src={order.giftImage} alt={order.giftName} />
                  <div className="order-info">
                    <h3>{order.giftName}</h3>
                    <p>Pour: {order.recipientName}</p>
                    <p className="order-date">Commandé le {order.orderDate}</p>
                  </div>
                  <div
                    className="status-indicator"
                    style={{ backgroundColor: getStatusColor(order.status) }}
                  >
                    {getCurrentStepIndex(order.tracking) + 1}/
                    {order.tracking.length}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panneau de mise à jour */}
          <div className="update-panel">
            {selectedOrder ? (
              <>
                <div className="selected-order-header">
                  <img
                    src={selectedOrder.giftImage}
                    alt={selectedOrder.giftName}
                  />
                  <div>
                    <h2>{selectedOrder.giftName}</h2>
                    <p>
                      Commande #{selectedOrder.id.substring(0, 8)} -{" "}
                      {selectedOrder.recipientName}
                    </p>
                    <p>
                      Statut actuel:{" "}
                      <span
                        style={{
                          color: getStatusColor(selectedOrder.status),
                          fontWeight: "bold",
                        }}
                      >
                        {selectedOrder.status}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="status-steps">
                  <h3>Mettre à jour au statut suivant</h3>
                  <div className="steps-grid">
                    {/* On utilise fullStatusSteps ici pour l'affichage des boutons */}
                    {fullStatusSteps.map((step, index) => {
                      const currentStepIndex = getCurrentStepIndex(
                        selectedOrder.tracking
                      );
                      const isCompleted = index <= currentStepIndex;

                      return (
                        <button
                          key={index}
                          className={`step-button ${
                            isCompleted ? "completed" : ""
                          }`}
                          // Le bouton de l'étape actuelle (dernière complétée) est désactivé
                          onClick={() => handleUpdateStatus(index)}
                          disabled={updating || isCompleted}
                        >
                          <span className="step-number">{index + 1}</span>
                          <span className="step-name">{step}</span>
                          {isCompleted && <span className="step-check">✓</span>}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="current-tracking">
                  <h3>Suivi actuel de la commande</h3>
                  <div className="tracking-timeline">
                    {selectedOrder.tracking.map((step, index) => (
                      <div
                        key={index}
                        className={`timeline-step ${
                          step.completed ? "completed" : "pending"
                        }`}
                      >
                        <div className="timeline-icon">
                          {step.completed ? "✓" : "○"}
                        </div>
                        <div className="timeline-content">
                          <div className="timeline-label">{step.label}</div>
                          {step.date && (
                            <div className="timeline-date">{step.date}</div>
                          )}
                          {step.message && (
                            <div className="timeline-message">
                              {step.message}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <div className="no-selection-icon">📦</div>
                <h3>Aucune commande sélectionnée</h3>
                <p>Sélectionnez une commande à gauche pour gérer son statut</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default UpdateOrderStatus;
