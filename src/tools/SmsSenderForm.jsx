import { useState, useEffect } from "react"; // 👈 Ajout de useEffect
import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  doc, 
  getDoc, 
  updateDoc, 
  increment 
} from "firebase/firestore";
import { auth, db } from "../firebase/config"; 
import "./SmsSenderForm.css";

const SmsSenderForm = () => {
  const [formData, setFormData] = useState({
    senderName: "",
    phoneNumber: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  // 💰 Coût d'un SMS
  const SMS_COST = 2500; 

  // ✨ EFFET POUR SUPPRIMER LE MESSAGE APRÈS 5 SECONDES
  useEffect(() => {
    if (status.message) {
      const timer = setTimeout(() => {
        setStatus({ type: "", message: "" });
      }, 5000); // 5000ms = 5 secondes

      // Nettoyage du timer si le composant est démonté ou si le status change
      return () => clearTimeout(timer);
    }
  }, [status]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour sauvegarder dans Firebase
  const saveToFirebase = async (smsData, userId) => {
    try {
      await addDoc(collection(db, "sms_history"), {
        userId: userId, 
        senderName: smsData.from,
        receiverNumber: smsData.to,
        message: smsData.text, 
        status: smsData.status,
        messageId: smsData.messageId || null,
        createdAt: serverTimestamp(),
      });
      console.log("✅ SMS sauvegardé dans Firebase");
    } catch (error) {
      console.error("❌ Erreur Firebase:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Vérifier si l'utilisateur est connecté
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setStatus({ type: "error", message: "Vous devez être connecté." });
      return;
    }

    setLoading(true);
    setStatus({ type: "", message: "" }); // Reset avant nouvel envoi

    try {
      // 2. Vérifier le solde de Coins
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      
      if (!userSnap.exists()) {
        throw new Error("Utilisateur introuvable");
      }

      const userData = userSnap.data();
      const currentBalance = userData.coins || 0;

      if (currentBalance < SMS_COST) {
        setStatus({ type: "error", message: `Solde insuffisant. Coût: ${SMS_COST} Coins.` });
        setLoading(false);
        return;
      }

      // 3. Appel à l'API Backend
      const response = await fetch("http://localhost:5000/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formData.senderName, 
          to: formData.phoneNumber,
          message: formData.message, 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        // 4. Succès : Débiter les Coins
        await updateDoc(userRef, {
          coins: increment(-SMS_COST)
        });

        setStatus({
          type: "success",
          message: "SMS envoyé avec succès ! ✓",
        });

        // 5. Sauvegarder dans l'historique
        await saveToFirebase({
          from: formData.senderName,
          to: formData.phoneNumber,
          text: formData.message,
          status: "Succès",
          messageId: data.details?.messages?.[0]?.messageId || "ID_INCONNU",
        }, currentUser.uid);

        // Réinitialiser le formulaire
        setFormData({
          senderName: "",
          phoneNumber: "",
          message: "",
        });
      } else {
        // Échec API
        setStatus({
          type: "error",
          message: data.error || "Erreur lors de l'envoi",
        });

        await saveToFirebase({
          from: formData.senderName,
          to: formData.phoneNumber,
          text: formData.message,
          status: "Échec",
          messageId: null,
        }, currentUser.uid);
      }
    } catch (error) {
      console.error(error);
      setStatus({
        type: "error",
        message: "Erreur de connexion au serveur",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sms-mini-container">
      <h2>Envoi de SMS Pro</h2>

      <form onSubmit={handleSubmit}>
        <div className="form-field">
          <label>NOM DE L'EXPÉDITEUR (Alphanumérique)</label>
          <input
            className="input-style"
            type="text"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            maxLength={11} 
            placeholder="Ex: flowerExp"
            required
            disabled={loading}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Max 11 caractères (Lettres et chiffres uniquement)
          </small>
        </div>

        <div className="form-field">
          <label>NUMÉRO DU DESTINATAIRE</label>
          <input
            className="input-style"
            type="tel"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            placeholder="Ex: 2250707..."
            required
            disabled={loading}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Format international (sans +)
          </small>
        </div>

        <div className="form-field">
          <label>MESSAGE</label>
          <textarea
            className="input-style textarea-style"
            name="message"
            value={formData.message}
            onChange={handleChange}
            placeholder="Votre message..."
            required
            disabled={loading}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            {formData.message.length} caractères
          </small>
        </div>

        {status.message && (
          <div
            style={{
              padding: "12px",
              marginBottom: "15px",
              borderRadius: "4px",
              backgroundColor: status.type === "success" ? "#d4edda" : "#f8d7da",
              color: status.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${
                status.type === "success" ? "#c3e6cb" : "#f5c6cb"
              }`,
              transition: "opacity 0.5s ease-in-out" // Animation optionnelle
            }}
          >
            {status.message}
          </div>
        )}

        <button
          type="submit"
          className="btn-send"
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "ENVOI EN COURS..." : `ENVOYER (${SMS_COST} Coins)`}
        </button>
      </form>
    </div>
  );
};

export default SmsSenderForm;