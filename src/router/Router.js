import { BrowserRouter, Route, Routes } from "react-router-dom";
import React from "react";
import Header from "../utilities/Header";
import Home from "../pages/Home";
import Footer from "../utilities/Footer";
import Connexion from "../admin/Connexion";

const Router = () => {
  return (
    <BrowserRouter>
      <Header />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/connexion" element={<Connexion />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  );
};

export default Router;
