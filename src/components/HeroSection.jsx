import React from "react";
import "./HeroSection.css";

const HeroSection = () => {
  const scrollToMission = () => {
    const missionSection = document.getElementById("mission-section");
    if (missionSection) {
      missionSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section id="apropos" className="hero-container">
      <div className="hero-content  ">
        <h1>Bâtir un avenir lumineux</h1>
        <p>
          En tant que jeunes ambassadeurs du Christ, nous sommes des flambeaux
          de lumière, éclairant les nations avec la vérité de l'Évangile.
        </p>
        <button className="hero-button" onClick={scrollToMission}>
          En savoir plus
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
