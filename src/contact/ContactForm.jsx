// src/components/ContactForm/ContactForm.jsx

import React, { useState } from "react";
import "./ContactForm.css"; // N'oubliez pas de créer ce fichier CSS
import AccountLayout from "../layout/AccountLayout";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const [status, setStatus] = useState(""); // 'success', 'error', 'sending'

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("sending");

    // Ici, vous enverriez les données à votre backend ou à un service comme EmailJS.
    // Pour cet exemple, nous allons simuler un envoi.

    console.log("Envoi des données de contact:", formData);

    try {
      // Exemple avec une API (non fonctionnel sans un vrai backend)
      // const response = await fetch('/api/contact', {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify(formData),
      // });

      // if (response.ok) {
      //   setStatus('success');
      //   setFormData({ name: '', email: '', subject: '', message: '' }); // Réinitialiser le formulaire
      // } else {
      //   setStatus('error');
      // }

      // Simulation d'un délai d'envoi
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Si la simulation est réussie :
      setStatus("success");
      setFormData({ name: "", email: "", subject: "", message: "" }); // Réinitialiser le formulaire
    } catch (error) {
      console.error("Erreur lors de l'envoi du message:", error);
      setStatus("error");
    }
  };

  return (
    <AccountLayout>
      <div className="contact-container">
        <h2>Contactez-nous</h2>
        <p>Nous sommes là pour répondre à toutes vos questions.</p>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="name">Nom :</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="email">Email :</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="subject">Sujet :</label>
            <input
              type="text"
              id="subject"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="message">Message :</label>
            <textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              rows="5"
              required
            ></textarea>
          </div>

          <button type="submit" disabled={status === "sending"}>
            {status === "sending" ? "Envoi..." : "Envoyer le message"}
          </button>

          {status === "success" && (
            <p className="success-message">
              Votre message a été envoyé avec succès !
            </p>
          )}
          {status === "error" && (
            <p className="error-message">
              Une erreur est survenue lors de l'envoi. Veuillez réessayer.
            </p>
          )}
        </form>
      </div>
    </AccountLayout>
  );
};

export default ContactForm;
