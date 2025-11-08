const functions = require("firebase-functions");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

admin.initializeApp();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: functions.config().email.user,
    pass: functions.config().email.password,
  },
});

/**

 * @param {object} data - Les données envoyées depuis le client (React).
 * @param {object} context - Informations sur l'authentification de l'appelant.
 */
exports.sendGiftConfirmation = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Seuls les utilisateurs connectés peuvent effectuer cette action."
    );
  }

  const { userEmail, giftName, recipientName, senderName } = data;

  if (!userEmail || !giftName) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Les données minimales (userEmail, giftName) sont manquantes pour l'envoi de l'e-mail."
    );
  }

  const mailOptions = {
    from: `"Votre Service Cadeaux" <${functions.config().email.user}>`,
    to: userEmail,
    subject: `🎉 Commande Confirmée : ${giftName} a été envoyé !`,
    html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #ddd; border-radius: 8px; overflow: hidden;">
                <div style="background-color: #4CAF50; color: white; padding: 20px; text-align: center;">
                    <h2>Commande de Cadeau Confirmée ! 🎁</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Bonjour ${context.auth.token.name || userEmail},</p>
                    <p>Nous vous remercions pour votre achat. Le cadeau suivant a été envoyé avec succès :</p>
                    
                    <h3 style="color: #4CAF50; border-bottom: 1px solid #eee; padding-bottom: 5px;">${giftName}</h3>
                    
                    <p><strong>Destinataire :</strong> ${
                      recipientName || "Non spécifié"
                    }</p>
                    <p><strong>Envoyeur (Vous) :</strong> ${
                      senderName || "Anonyme"
                    }</p>
                    <p>Votre solde de Coins a été débité. La livraison du cadeau est en cours de traitement.</p>
                    
                    <p>Merci de faire confiance à notre service !</p>
                </div>
                <div style="background-color: #f4f4f4; text-align: center; padding: 10px; font-size: 0.8em; color: #777;">
                    Ceci est un message automatique.
                </div>
            </div>
        `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(
      `E-mail de confirmation envoyé à: ${userEmail} pour ${giftName}`
    );
    return { success: true, message: "Email de confirmation envoyé." };
  } catch (error) {
    console.error("Erreur Nodemailer (e-mail) :", error);
    throw new functions.https.HttpsError(
      "internal",
      "Échec de l'envoi de l'e-mail de confirmation.",
      error.message
    );
  }
});
