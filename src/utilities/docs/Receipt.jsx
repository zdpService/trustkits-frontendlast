import React from "react";
import "./Receipt.css";

// 💰 Fonction utilitaire pour convertir le prix en Euros en prix en Coins
const formatPriceToCoins = (priceString) => {
  // Supposons que priceString est au format "XX€" ou juste un nombre.
  const numericPrice = parseFloat(priceString.replace("€", "").trim());

  // Taux de conversion arbitraire pour l'exemple (1€ = 100 Coins)
  if (isNaN(numericPrice)) {
    return { value: 0, formatted: "0 Coins" };
  }

  const coinsValue = Math.round(numericPrice * 100);
  return { value: coinsValue, formatted: `${coinsValue} Coins` };
};

const Receipt = ({ order, onClose }) => {
  // Fonction pour formater la date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // 🎯 NOUVELLE FONCTION pour extraire le prix en Coins
  const unitPriceData = formatPriceToCoins(order.price);

  const unitPrice = unitPriceData.value;
  const unitPriceFormatted = unitPriceData.formatted;

  // Calculer les valeurs
  const quantity = 1;
  const totalAmount = unitPrice * quantity; // Total en valeur numérique Coins

  // Utiliser l'ID Firebase directement
  const firebaseId = order.id || "N/A";

  // Fonction pour formater le montant total en Coins
  const formatTotalInCoins = (amount) =>
    `${amount.toLocaleString("fr-FR")} Coins`;

  return (
    // Overlay pour le modal
    <div className="receipt-overlay" onClick={onClose}>
      {/* Wrapper qui empêche la fermeture au clic */}
      <div
        className="receipt-modal-wrapper"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Bouton de fermeture */}
        <button className="receipt-close-btn" onClick={onClose}>
          ✕
        </button>

        {/* Contenu du reçu (votre structure exacte) */}
        <section className="ticket__container">
          <div className="ticket__title">
            <p></p>
            <h4>Reçu de paiment</h4>
            <p></p>
          </div>
          <div className="ticket__items">
            <div className="ticket__items-title">
              <h4>Facturé à :</h4>
            </div>
            <ul className="ticket__items-elements">
              <li className="ticket__items-elements__list">
                <div className="ticket__items-elements__list-cards">
                  <span>Nom :</span>
                  <p>{order.recipientName}</p>
                </div>
              </li>
              <li className="ticket__items-elements__list">
                <div className="ticket__items-elements__list-cards">
                  <span>Adresse :</span>
                  <p>
                    {order.recipientAddress}, {order.recipientCity},
                    {order.recipientCountry}
                  </p>
                </div>
              </li>
              <li className="ticket__items-elements__list">
                <div className="ticket__items-elements__list-cards">
                  <span>Date :</span>
                  <p>{formatDate(order.orderDate)}</p>
                </div>
              </li>
              <li className="ticket__items-elements__list">
                <div className="ticket__items-elements__list-cards">
                  <span>Méthode de paiement :</span>
                  <p>FuisonPay (Coins)</p> {/* Mis à jour ici si pertinent */}
                </div>
              </li>
              {/* ID Firebase ajouté */}
              <li className="ticket__items-elements__list">
                <div className="ticket__items-elements__list-cards">
                  <span>ID Transaction :</span>
                  <p className="firebase-id">{firebaseId}</p>
                </div>
              </li>
            </ul>
          </div>
          <p className="lineDased"></p>
          <div className="product_items">
            <div className="product_items-elements">
              <h5>produit (s)</h5>
              <div className="product_list">
                <span>{order.giftName}</span>
              </div>
            </div>
            <div className="product_items_quality">
              <span>Qauntité</span>
              <ul className="product_items_quality_list">
                <li>{quantity}</li>
              </ul>
            </div>
            <div className="product_items_total">
              <span>prix unitaire</span> {/* 🎯 Mise à jour du libellé */}
              <ul className="product_items_total_list">
                {/* 🎯 Affichage du prix unitaire en Coins */}
                <li>{unitPrice}</li>
              </ul>
            </div>
            <div className="product_items_price">
              <span>Montant </span> {/* 🎯 Mise à jour du libellé */}
              <ul className="product_items_price_list">
                {/* 🎯 Affichage du montant total en Coins */}
                <li>{totalAmount}</li>
              </ul>
            </div>
          </div>
          <div className="totalsection">
            <div className="totals">
              <h5>Total </h5> {/* 🎯 Mise à jour du libellé */}
              {/* 🎯 Affichage du total en Coins */}
              <span>{formatTotalInCoins(totalAmount)}</span>
            </div>
          </div>
          <p className="lineDased"></p>
          <div className="section__orders">
            <p>Merci pour vôtre confiance à bientôt !</p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Receipt;
