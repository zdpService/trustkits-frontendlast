import emailjs from "@emailjs/browser";

// --- Configuration EmailJS ---
// Assurez-vous que les IDs ci-dessous sont corrects pour vos templates EmailJS
const EMAILJS_SERVICE_ID = "service_hpoz1jr";
const EMAILJS_TEMPLATE_ID_RECIPIENT = "template_dn1qexn"; // Template de notification au destinataire (existant)

// 🛑 ERREUR 400 : CET ID EST LA CAUSE DU PROBLÈME.
// VEUILLEZ REMPLACER CETTE CHAÎNE DE CARACTÈRES PAR L'ID EXACT DE VOTRE TEMPLATE DE CONFIRMATION ACHETEUR DANS EMAILJS.
const EMAILJS_TEMPLATE_ID_BUYER_CONFIRMATION = "template_dn1qexn";

const EMAILJS_PUBLIC_KEY = "77F7v7-D1pYthjM9I";

// --- Initialisation ---
export const initEmailJS = () => {
  emailjs.init(EMAILJS_PUBLIC_KEY);
  console.log("✅ EmailJS initialisé");
};

// --- Formatage de la date ---
const formatDate = () => {
  return new Date().toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const sendGiftOrderEmail = async (orderData) => {
  try {
    const templateParams = {
      to_email: orderData.recipientEmail,
      recipient_name: `${orderData.recipientFirstName} ${orderData.recipientLastName}`,
      gift_name: orderData.giftName,
      gift_price: orderData.price,
      sender_name: orderData.senderName,
      order_date: formatDate(),
      delivery_address: `${orderData.recipientAddress}, ${orderData.recipientCity}, ${orderData.recipientCountry}`,
      recipient_phone: orderData.recipientPhone,
      message: orderData.message || "Aucun message personnalisé",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_RECIPIENT,
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Email envoyé avec succès au destinataire:", response);
    return { success: true, response };
  } catch (error) {
    console.error(
      "❌ Erreur lors de l'envoi de l'email au destinataire:",
      error
    );
    return { success: false, error };
  }
};

// --- 2. Confirmation à l'Acheteur ---
export const sendBuyerConfirmationEmail = async (orderData, buyerEmail) => {
  try {
    // Construction de l'adresse complète pour le template HTML
    const fullAddress = `${orderData.recipientAddress}, ${orderData.recipientCity}, ${orderData.recipientCountry}`;

    // Paramètres requis par le template HTML de confirmation
    const templateParams = {
      // ➡️ Destinataire
      to_email: buyerEmail,

      // ➡️ Header
      order_number: orderData.order_number,

      // ➡️ Salutation
      sender_name: orderData.senderName,
      recipient_name: `${orderData.recipientFirstName} ${orderData.recipientLastName}`,

      // ➡️ Cadeau
      gift_name: orderData.giftName,
      gift_price: orderData.price,
      gift_image: orderData.giftImage,
      order_date: orderData.order_date || formatDate(),

      // ➡️ Livraison
      full_address: fullAddress, // Correspond à {{full_address}} dans le HTML
      recipient_phone: orderData.recipientPhone,

      // ➡️ Message Personnel
      personal_message: orderData.message || "Pas de message personnalisé.",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_BUYER_CONFIRMATION, // DOIT UTILISER L'ID CORRECT ICI
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("✅ Email de confirmation acheteur envoyé:", response);
    return { success: true, response };
  } catch (error) {
    console.error("❌ Erreur lors de l'envoi de l'email acheteur:", error);
    return { success: false, error };
  }
};
// --- 3. Notification à l'Admin ---
export const sendAdminNotificationEmail = async (orderData) => {
  try {
    const fullAddress = `${orderData.recipientAddress}, ${orderData.recipientCity}, ${orderData.recipientCountry}`;

    const templateParams = {
      to_email: "endrienj2@gmail.com", // Admin
      order_number: orderData.order_number,
      order_date: orderData.order_date || formatDate(),

      // Infos acheteur
      sender_name: orderData.senderName,

      // Infos destinataire
      recipient_name: `${orderData.recipientFirstName} ${orderData.recipientLastName}`,
      recipient_email: orderData.recipientEmail,
      full_address: fullAddress,
      recipient_phone: orderData.recipientPhone,

      // Cadeau
      gift_name: orderData.giftName,
      gift_price: orderData.price,
      gift_image: orderData.giftImage,

      // Message
      personal_message: orderData.message || "Aucun message.",
    };

    const response = await emailjs.send(
      EMAILJS_SERVICE_ID,
      EMAILJS_TEMPLATE_ID_BUYER_CONFIRMATION, // Réutilise le même template (ou un dédié si tu veux)
      templateParams,
      EMAILJS_PUBLIC_KEY
    );

    console.log("Notification admin envoyée à endrienj2@gmail.com:", response);
    return { success: true, response };
  } catch (error) {
    console.error("Erreur envoi notification admin:", error);
    return { success: false, error };
  }
};
