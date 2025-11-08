import React, { useState } from "react";
import { useGiftContext } from "../context/GiftContext";
import Receipt from "../utilities/docs/Receipt";
import Loading from "../utilities/laoding/Loading";
import "./GiftHistory.css";

const formatPriceToCoins = (priceString) => {
  const numericPrice = parseFloat(priceString.replace("€", "").trim());
  if (isNaN(numericPrice)) return "N/A Coins";
  const coinsValue = Math.round(numericPrice * 100);
  return `${coinsValue} Coins`;
};

const GiftHistory = () => {
  const { giftHistory, loading, error, deleteGift } = useGiftContext();
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showReceipt, setShowReceipt] = useState(false);

  const handleDownloadReceipt = (order) => {
    setSelectedOrder(order);
    setShowReceipt(true);
  };

  const handleContactSupport = (order) => {
    alert(`Contacter le support pour la commande #${order.id}`);
  };

  const handleCloseReceipt = () => {
    setShowReceipt(false);
  };

  const handleDeleteOrder = async (orderId) => {
    if (!deleteGift) {
      alert("Fonction de suppression indisponible.");
      return;
    }

    if (window.confirm("Supprimer définitivement cette commande ?")) {
      try {
        await deleteGift(orderId);
        setSelectedOrder(null);
      } catch (err) {
        console.error("Erreur suppression:", err);
        alert("Échec de la suppression.");
      }
    }
  };

  // CHARGEMENT PERSONNALISÉ
  if (loading) {
    return (
      <div className="history-container">
        <h1>Historique des envois</h1>
        <Loading message="Chargement de l'historique..." />
      </div>
    );
  }

  // ERREUR
  if (error) {
    return (
      <div className="history-container">
        <h1>Historique des envois</h1>
        <div className="error-state">
          <div className="error-icon">Warning</div>
          <h3>Erreur de chargement</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>Réessayer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <h1>Historique des envois</h1>

      {giftHistory.length === 0 ? (
        <div className="no-history">
          <div className="no-history-icon">
            <h3>Aucun cadeau envoyé</h3>
          </div>
        </div>
      ) : (
        <div className="history-list">
          {giftHistory.map((order) => (
            <div key={order.id} className="history-item">
              <img src={order.giftImage} alt={order.giftName} />
              <div className="item-info">
                <h3>{order.giftName}</h3>
                <p className="recipient">Pour: {order.recipientName}</p>
                <p className="location">
                  {order.recipientCity}, {order.recipientCountry}
                </p>
              </div>
              <div className="item-details">
                <p className="date">{order.orderDate}</p>
                <p className="price">{formatPriceToCoins(order.price)}</p>
                <span
                  className={`status ${order.status
                    .toLowerCase()
                    .replace(" ", "-")}`}
                >
                  {order.status}
                </span>
                <button
                  className="view-btn"
                  onClick={() => setSelectedOrder(order)}
                >
                  Voir détails
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {selectedOrder && !showReceipt && (
        <div className="details-modal" onClick={() => setSelectedOrder(null)}>
          <div className="details-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-btn"
              onClick={() => setSelectedOrder(null)}
            >
              ×
            </button>
            <h2>Détails de la commande #{selectedOrder.id}</h2>

            <div className="details-grid">
              {/* Cadeau */}
              <div className="detail-section">
                <h3>Cadeau</h3>
                <div className="gift-display">
                  <img
                    src={selectedOrder.giftImage}
                    alt={selectedOrder.giftName}
                  />
                  <div>
                    <h4>{selectedOrder.giftName}</h4>
                    <p className="detail-price">
                      {formatPriceToCoins(selectedOrder.price)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Destinataire */}
              <div className="detail-section">
                <h3>Destinataire</h3>
                <p>
                  <strong>Nom:</strong> {selectedOrder.recipientName}
                </p>
                <p>
                  <strong>Adresse:</strong> {selectedOrder.recipientAddress}
                </p>
                <p>
                  <strong>Ville:</strong> {selectedOrder.recipientCity}
                </p>
                <p>
                  <strong>Pays:</strong> {selectedOrder.recipientCountry}
                </p>
                <p>
                  <strong>Téléphone:</strong> {selectedOrder.recipientPhone}
                </p>
              </div>

              {/* Envoyeur */}
              <div className="detail-section">
                <h3>Envoyeur</h3>
                <p>
                  <strong>Nom:</strong> {selectedOrder.senderName}
                </p>
                {selectedOrder.message && (
                  <div className="message-box">
                    <strong>Message:</strong> <p>"{selectedOrder.message}"</p>
                  </div>
                )}
              </div>

              {/* Suivi */}
              <div className="detail-section tracking-section">
                <h3>Suivi de livraison</h3>
                <div className="tracking-list">
                  {selectedOrder.tracking.map((step, index) => (
                    <div
                      key={index}
                      className={`tracking-step ${
                        step.completed ? "completed" : "pending"
                      }`}
                    >
                      <div className="step-icon">
                        {step.completed ? "Check" : "Circle"}
                      </div>
                      <div className="step-content">
                        <div className="step-label">{step.label}</div>
                        {step.date && (
                          <div className="step-date">{step.date}</div>
                        )}
                        {step.message && (
                          <div className="step-message">{step.message}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="details-actions">
              <button
                className="download-btn"
                onClick={() => handleDownloadReceipt(selectedOrder)}
              >
                Voir le reçu
              </button>
              <button
                className="support-btn"
                onClick={() => handleContactSupport(selectedOrder)}
              >
                Contacter le support
              </button>
              <button
                className="delete-btn"
                onClick={() => handleDeleteOrder(selectedOrder.id)}
              >
                Supprimer la commande
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REÇU */}
      {showReceipt && selectedOrder && (
        <Receipt
          order={selectedOrder}
          onClose={handleCloseReceipt}
          onDownload={(order) => console.log("Téléchargement reçu:", order)}
        />
      )}
    </div>
  );
};

export default GiftHistory;
