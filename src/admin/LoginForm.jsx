import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAdmin } from "../context/context"; // Assure-toi que le chemin est correct
import "./LoginForm.css";

const LoginForm = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { setIsAdmin } = useAdmin(); // Récupère la fonction pour changer l'état admin
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    // Vérification des identifiants
    if (email === "0000" && password === "11111") {
      setError("");
      setIsAdmin(true); // <- Active l'état admin
      alert("Connexion réussie !");
      navigate("/"); // Redirige vers l'accueil ou une page admin
    } else {
      setError("Email ou mot de passe incorrect !");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="login-form">
      <input
        type="text"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Mot de passe"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      {error && <p className="error-text">{error}</p>}
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default LoginForm;
