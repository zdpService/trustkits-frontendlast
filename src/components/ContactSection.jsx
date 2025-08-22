import React from "react";
import "./ContactSection.css";

const ContactSection = () => {
  return (
    <section className="contact-section" id="contact">
      <div className="contact-container">
        <div>
          <h2 className="contact-title">Nous Contacter</h2>
          <p className="contact-subtitle">
            Pour toute question ou information, n'hésitez pas à nous contacter.
            Nous serons ravis de vous répondre.
          </p>

          <div className="contact-info">
            <div className="contact-item">
              <i className="fas fa-envelope"></i>
              <p>
                Email : <a href="mailto:info@cma-ci.org">info@cma-ci.org</a>
              </p>
            </div>
            <div className="contact-item">
              <i className="fas fa-phone"></i>
              <p>
                Téléphone : <a href="tel:+2250102030405">+225 01 02 03 04 05</a>
              </p>
            </div>
            <div className="contact-item">
              <i className="fas fa-map-marker-alt"></i>
              <p>Adresse : Abidjan, Côte d'Ivoire</p>
            </div>
          </div>
        </div>

        <form className="contact-form">
          <input type="text" placeholder="Votre Nom" required />
          <input type="email" placeholder="Votre Email" required />
          <textarea placeholder="Votre Message" required></textarea>
          <button type="submit">Envoyer</button>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;
