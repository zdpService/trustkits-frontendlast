import { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";
import "./SmsSenderForm.css";

const SmsSenderForm = () => {
  const [formData, setFormData] = useState({
    senderName: "",
    phoneNumber: "",
    message: "",
  });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: "", message: "" });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Fonction pour sauvegarder dans Firebase
  const saveToFirebase = async (smsData) => {
    try {
      await addDoc(collection(db, "sms_history"), {
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
    setLoading(true);
    setStatus({ type: "", message: "" });

    try {
      // Appel à votre API backend
      const response = await fetch("http://localhost:5000/api/send-sms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: formData.senderName,
          to: formData.phoneNumber,
          text: formData.message,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus({
          type: "success",
          message: "SMS envoyé avec succès ! ✓",
        });

        // Sauvegarder dans Firebase
        await saveToFirebase({
          from: formData.senderName,
          to: formData.phoneNumber,
          text: formData.message,
          status: "Succès",
          messageId: data.messageId,
        });

        // Réinitialiser le formulaire
        setFormData({
          senderName: "",
          phoneNumber: "",
          message: "",
        });
      } else {
        setStatus({
          type: "error",
          message: data.error || "Erreur lors de l'envoi du SMS",
        });

        // Sauvegarder l'échec dans Firebase aussi
        await saveToFirebase({
          from: formData.senderName,
          to: formData.phoneNumber,
          text: formData.message,
          status: "Échec",
          messageId: null,
        });
      }
    } catch (error) {
      setStatus({
        type: "error",
        message: "Erreur de connexion au serveur",
      });

      // Sauvegarder l'erreur dans Firebase
      await saveToFirebase({
        from: formData.senderName,
        to: formData.phoneNumber,
        text: formData.message,
        status: "Erreur",
        messageId: null,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="sms-mini-container">
      <h2>Envoi de SMS Pro</h2>

      <div>
        <div className="form-field">
          <label>NOM DE L'EXPÉDITEUR</label>
          <input
            className="input-style"
            type="text"
            name="senderName"
            value={formData.senderName}
            onChange={handleChange}
            maxLength={11}
            placeholder="Nom de l'expéditeur"
            required
            disabled={loading}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Max 11 caractères alphanumériques
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
            placeholder="Ex: +225..."
            required
            disabled={loading}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            Format international avec indicatif pays
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
              backgroundColor:
                status.type === "success" ? "#d4edda" : "#f8d7da",
              color: status.type === "success" ? "#155724" : "#721c24",
              border: `1px solid ${
                status.type === "success" ? "#c3e6cb" : "#f5c6cb"
              }`,
            }}
          >
            {status.message}
          </div>
        )}

        <button
          onClick={handleSubmit}
          className="btn-send"
          disabled={loading}
          style={{
            opacity: loading ? 0.6 : 1,
            cursor: loading ? "not-allowed" : "pointer",
          }}
        >
          {loading ? "ENVOI EN COURS..." : "ENVOYER LE SMS"}
        </button>
      </div>
    </div>
  );
};

export default SmsSenderForm;
