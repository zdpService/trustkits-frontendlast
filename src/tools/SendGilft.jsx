import React, { useState, useContext } from "react";
import { useGiftContext } from "../context/GiftContext";
import { CoinsContext } from "../context/CoinsContext";
import { auth } from "../firebase/config";
import Loading from "../utilities/laoding/Loading";
import "./SendGilft.css";

import {
  sendGiftOrderEmail,
  sendBuyerConfirmationEmail,
  sendAdminNotificationEmail,
} from "../services/emailService";

const SendGift = () => {
  const { addGift, catalog, catalogLoading } = useGiftContext();
  const { coins, updateCoins } = useContext(CoinsContext);

  // États UI
  const [showAll, setShowAll] = useState(false);
  const [selectedGift, setSelectedGift] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState("Tous");
  const [showCart, setShowCart] = useState(false);
  const [cartItem, setCartItem] = useState(null);
  const [sending, setSending] = useState(false);

  // Formulaire
  const [formData, setFormData] = useState({
    recipientFirstName: "",
    recipientLastName: "",
    recipientCountry: "",
    recipientCity: "",
    recipientAddress: "",
    recipientPhone: "",
    recipientEmail: "",
    senderName: "",
    message: "",
  });

  // CHARGEMENT
  if (catalogLoading) {
    return (
      <div className="send-gift-container">
        <Loading message="Chargement du catalogue..." />
      </div>
    );
  }

  // CATALOGUE VIDE
  if (!catalog || catalog.length === 0) {
    return (
      <div className="send-gift-container">
        <div className="gift-header">
          <h1>Collection Premium de Cadeaux</h1>
          <p>Aucun cadeau disponible pour le moment.</p>
        </div>
      </div>
    );
  }

  // CATÉGORIES UNIQUES
  const categories = ["Tous", ...new Set(catalog.map((g) => g.category))];

  // FILTRES
  const filteredGifts =
    selectedCategory === "Tous"
      ? catalog
      : catalog.filter((g) => g.category === selectedCategory);

  const displayedGifts = showAll ? filteredGifts : filteredGifts.slice(0, 7);

  // SÉLECTION
  const handleSelectGift = (gift) => setSelectedGift(gift);

  const handleChooseGift = () => {
    setCartItem(selectedGift);
    setShowCart(true);
    setSelectedGift(null);
  };

  // FORMULAIRE
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    if (name === "message") {
      const lines = value.split("\n");
      if (lines.length <= 5) {
        setFormData((prev) => ({ ...prev, [name]: value }));
      }
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // PRIX
  const extractPriceInCoins = (priceString) => {
    return parseInt(priceString.replace(" coins", "").trim(), 10) || 0;
  };

  const cartCost = cartItem ? extractPriceInCoins(cartItem.price) : 0;
  const isBalanceSufficient = coins >= cartCost;
  const formatCoins = (amount) => `${amount.toLocaleString("fr-FR")} Coins`;

  // ENVOI
  const handleSendGift = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);

    if (!isBalanceSufficient) {
      alert("Solde insuffisant.");
      setSending(false);
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Non authentifié.");
      setSending(false);
      return;
    }

    const buyerEmail = user.email;
    const orderNumber = Date.now().toString();

    try {
      const newBalance = coins - cartCost;
      await updateCoins(user.uid, newBalance);

      const orderDataForDB = {
        giftName: cartItem.name,
        giftImage: cartItem.image,
        price: cartItem.price,
        orderNumber,
        orderDate: new Date().toISOString(),
        ...formData,
      };

      const newOrder = await addGift(orderDataForDB);

      const emailData = {
        ...orderDataForDB,
        order_number: orderNumber,
        order_date: new Date().toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
        }),
        recipientEmail: formData.recipientEmail,
        recipientFirstName: formData.recipientFirstName,
        recipientLastName: formData.recipientLastName,
        recipientAddress: formData.recipientAddress,
        recipientCity: formData.recipientCity,
        recipientCountry: formData.recipientCountry,
        recipientPhone: formData.recipientPhone,
        senderName: formData.senderName,
        message: formData.message || "Aucun message.",
        giftImage: cartItem.image,
      };

      await Promise.all([
        sendGiftOrderEmail(emailData),
        sendBuyerConfirmationEmail(emailData, buyerEmail),
        sendAdminNotificationEmail(emailData),
      ]);

      alert(`Commande #${orderNumber} envoyée avec succès !`);
      setShowCart(false);
      setCartItem(null);
      setFormData({
        recipientFirstName: "",
        recipientLastName: "",
        recipientEmail: "",
        recipientCountry: "",
        recipientCity: "",
        recipientAddress: "",
        recipientPhone: "",
        senderName: "",
        message: "",
      });
    } catch (error) {
      console.error("Erreur envoi:", error);
      alert("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="send-gift-container">
      {/* EN-TÊTE */}
      <div className="gift-header">
        <h1>Collection Premium de Cadeaux</h1>
        <p>Découvrez notre sélection exclusive pour toutes les occasions</p>
      </div>

      {/* FILTRES */}
      <div className="category-filters">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`category-btn ${
              selectedCategory === cat ? "active" : ""
            }`}
            onClick={() => {
              setSelectedCategory(cat);
              setShowAll(false);
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* GRILLE DES CADEAUX */}
      <div className="gifts-grid">
        {displayedGifts.length > 0 ? (
          displayedGifts.map((gift) => (
            <div
              key={gift.id}
              className={`gift-card ${
                selectedGift?.id === gift.id ? "selected" : ""
              }`}
              onClick={() => handleSelectGift(gift)}
            >
              <div className="gift-image-container">
                <img src={gift.image} alt={gift.name} className="gift-image" />
                <div className="gift-overlay">
                  <span className="view-details">Voir détails</span>
                </div>
              </div>
              <div className="gift-content">
                <span className="gift-category-tag">{gift.category}</span>
                <h3>{gift.name}</h3>
                <div className="gift-footer">
                  <p className="gift-price">{gift.price}</p>
                  {selectedGift?.id === gift.id && (
                    <div className="selected-check">Check</div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-gifts">
            <p>Aucun cadeau dans cette catégorie.</p>
          </div>
        )}
      </div>

      {/* VOIR PLUS / MOINS */}
      {!showAll && filteredGifts.length > 7 && (
        <div className="voir-plus-container">
          <button className="voir-plus-btn" onClick={() => setShowAll(true)}>
            <span>Voir plus de cadeaux</span>
            <span className="count-badge">{filteredGifts.length - 7}</span>
          </button>
        </div>
      )}
      {showAll && filteredGifts.length > 7 && (
        <div className="voir-plus-container">
          <button className="voir-moins-btn" onClick={() => setShowAll(false)}>
            Voir moins
          </button>
        </div>
      )}

      {/* MODAL DÉTAILS */}
      {selectedGift && (
        <div
          className="selected-gift-modal"
          onClick={() => setSelectedGift(null)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button
              className="close-modal"
              onClick={() => setSelectedGift(null)}
            >
              ×
            </button>
            <div className="modal-image">
              <img src={selectedGift.image} alt={selectedGift.name} />
            </div>
            <div className="modal-details">
              <span className="modal-category">{selectedGift.category}</span>
              <h2>{selectedGift.name}</h2>
              <p className="modal-price">{selectedGift.price}</p>
              <p className="modal-description">
                Un cadeau parfait pour{" "}
                {selectedGift.category === "Romantique"
                  ? "votre bien-aimé(e)"
                  : selectedGift.category === "Bébé"
                  ? "les tout-petits"
                  : selectedGift.category === "Personnes âgées"
                  ? "nos aînés"
                  : "tous les moments spéciaux"}
                .
              </p>
              <button className="confirm-btn" onClick={handleChooseGift}>
                Choisir ce cadeau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PANIER */}
      {showCart && cartItem && (
        <div className="cart-modal" onClick={() => setShowCart(false)}>
          <div className="cart-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-modal" onClick={() => setShowCart(false)}>
              ×
            </button>

            <div className="cart-header">
              <h2>Panier d'envoi</h2>
              <p>Finalisez l'envoi de votre cadeau</p>
            </div>

            <div className="cart-item-display">
              <img src={cartItem.image} alt={cartItem.name} />
              <div className="cart-item-info">
                <span className="cart-category">{cartItem.category}</span>
                <h3>{cartItem.name}</h3>
                <p className="cart-price">{cartItem.price}</p>
              </div>
            </div>

            <form className="cart-form" onSubmit={handleSendGift}>
              <div className="form-section">
                <h3>Informations du destinataire</h3>
                <div className="form-row">
                  <div className="form-group">
                    <label>Nom *</label>
                    <input
                      type="text"
                      name="recipientLastName"
                      value={formData.recipientLastName}
                      onChange={handleFormChange}
                      placeholder="Dupont"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Prénom *</label>
                    <input
                      type="text"
                      name="recipientFirstName"
                      value={formData.recipientFirstName}
                      onChange={handleFormChange}
                      placeholder="Marie"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Email du destinataire *</label>
                  <input
                    type="email"
                    name="recipientEmail"
                    value={formData.recipientEmail}
                    onChange={handleFormChange}
                    placeholder="marie@exemple.com"
                    required
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Pays *</label>
                    <input
                      type="text"
                      name="recipientCountry"
                      value={formData.recipientCountry}
                      onChange={handleFormChange}
                      placeholder="France"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Ville *</label>
                    <input
                      type="text"
                      name="recipientCity"
                      value={formData.recipientCity}
                      onChange={handleFormChange}
                      placeholder="Paris"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Adresse *</label>
                  <input
                    type="text"
                    name="recipientAddress"
                    value={formData.recipientAddress}
                    onChange={handleFormChange}
                    placeholder="123 Rue de la Paix"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Téléphone *</label>
                  <input
                    type="tel"
                    name="recipientPhone"
                    value={formData.recipientPhone}
                    onChange={handleFormChange}
                    placeholder="+33 6 12 34 56 78"
                    required
                  />
                </div>
              </div>

              <div className="form-section">
                <h3>Informations de l'envoyeur</h3>
                <div className="form-group">
                  <label>Nom *</label>
                  <input
                    type="text"
                    name="senderName"
                    value={formData.senderName}
                    onChange={handleFormChange}
                    placeholder="De la part de..."
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Message (max 5 lignes)</label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleFormChange}
                    placeholder="Écrivez un message..."
                    rows="5"
                    maxLength="500"
                  />
                  <span className="char-count">
                    {formData.message.split("\n").length}/5 lignes
                  </span>
                </div>
              </div>

              <div className="cart-summary">
                <div className="summary-row">
                  <span>Cadeau</span>
                  <span>{cartItem.price}</span>
                </div>
                <div className="summary-row balance-check">
                  <span>Votre solde</span>
                  <span
                    className={
                      isBalanceSufficient
                        ? "sufficient-balance"
                        : "insufficient-balance"
                    }
                  >
                    {formatCoins(coins)}
                  </span>
                </div>
                <div className="summary-row total">
                  <span>Total</span>
                  <span>{cartItem.price}</span>
                </div>
                {!isBalanceSufficient && (
                  <p className="insufficient-warning">
                    Solde insuffisant ! Manque : {formatCoins(cartCost - coins)}
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="send-gift-btn"
                disabled={sending || !isBalanceSufficient}
              >
                <span>
                  {sending
                    ? "Envoi en cours..."
                    : !isBalanceSufficient
                    ? "Solde insuffisant"
                    : "Payer et envoyer"}
                </span>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SendGift;
