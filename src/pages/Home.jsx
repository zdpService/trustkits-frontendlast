import React from "react";
import HeroSection from "../components/HeroSection";
import MissionValeurs from "../components/MissionValeurs";
import Actualites from "../components/Actualites";
import Galerie from "../components/Galerie ";
import VideoSlider from "../components/VideoSlider";
import ContactSection from "../components/ContactSection";

const Home = () => {
  return (
    <div>
      <HeroSection />
      <MissionValeurs />
      <Actualites />
      <Galerie />
      <VideoSlider />
      <ContactSection />
    </div>
  );
};

export default Home;
