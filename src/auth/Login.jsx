import React, { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Login.css";
import imageLogo from "../pages/Capture d’écran 2025-09-27 135702.png";

import { auth, db } from "../firebase/config";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { doc, setDoc, updateDoc, getDoc } from "firebase/firestore";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    nom: "",
    prenom: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    pays: "bj",
  });
  const [referrer, setReferrer] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const mode = params.get("mode");
    const ref = params.get("ref");

    setIsLogin(mode !== "inscription");
    if (ref) setReferrer(ref);
  }, [location.search]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        await signInWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        console.log("Connexion réussie !");
      } else {
        if (formData.password !== formData.confirmPassword) {
          alert("Les mots de passe ne correspondent pas");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email,
          formData.password
        );
        const user = userCredential.user;

        const userRef = doc(db, "users", user.uid);

        await setDoc(userRef, {
          nom: formData.nom,
          prenom: formData.prenom,
          email: formData.email,
          phone: formData.phone,
          pays: formData.pays,
          createdAt: new Date(),
          affiliation: {
            referrer: referrer || null,
            link: `${window.location.origin}/login?mode=inscription&ref=${user.uid}`,
            nombreAffilies: 0,
          },
          gains: 0,
          retraits: 0,
        });

        if (referrer) {
          const parrainRef = doc(db, "users", referrer);
          const parrainSnap = await getDoc(parrainRef);
          if (parrainSnap.exists()) {
            const parrainData = parrainSnap.data();
            await updateDoc(parrainRef, {
              "affiliation.nombreAffilies":
                (parrainData.affiliation?.nombreAffilies || 0) + 1,
            });
          }
        }

        console.log("Inscription réussie !");
      }

      // ⏳ Attente de 5 secondes pour l'animation
      setTimeout(() => {
        navigate("/account");
        setLoading(false);
      }, 5000);
    } catch (error) {
      console.error("Erreur :", error.message);
      alert("Adresse e-mail ou mot de passe incorrect!");
      setLoading(false);
    }
    setTimeout(5000);
  };

  return (
    <div className="login_container">
      <div className="login_card">
        <Link
          to={"/login"}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "150px",
            width: "150px",
          }}
        >
          <img
            style={{
              borderRadius: "50%",
              height: "100%",
              width: "100%",
              objectFit: "cover",
            }}
            src={imageLogo}
            alt="Logo"
          />
        </Link>

        <h2 className="login_title">
          {isLogin ? "Connexion à votre compte" : "Créer mon compte"}
        </h2>

        <p style={{ textAlign: "center" }}>
          {isLogin
            ? "Vous n'avez pas encore de compte ?"
            : "Vous avez déjà un compte ?"}
          <span
            className="login_link"
            onClick={() =>
              navigate(`/login?mode=${isLogin ? "inscription" : "connexion"}`)
            }
          >
            {isLogin ? "S'inscrire" : "Me connecter"}
          </span>
        </p>

        <form className="login_form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="form_row">
                <div className="form_group">
                  <label>Nom</label>
                  <input
                    type="text"
                    name="nom"
                    value={formData.nom}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form_group">
                  <label>Prénom</label>
                  <input
                    type="text"
                    name="prenom"
                    value={formData.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className="form_group">
                <label>Pays de résidence</label>
                <select
                  name="pays"
                  value={formData.pays}
                  onChange={handleChange}
                  required
                >
                  <option value="bj">🇧🇯 Bénin (+229)</option>
                  <option value="ci">🇨🇮 Côte d'Ivoire (+225)</option>
                  <option value="sn">🇸🇳 Sénégal (+221)</option>
                </select>
              </div>

              <div className="form_row">
                <div className="form_group">
                  <label>Adresse e-mail</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="form_group">
                  <label>Numéro de téléphone</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {isLogin && (
            <>
              <label>Adresse e-mail</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </>
          )}

          <label>Mot de passe</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <>
              <label>Confirmez votre mot de passe</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
            </>
          )}

          {isLogin && (
            <div className="login_row">
              <span
                className="login_link"
                onClick={() => alert("Mot de passe oublié ?")}
              >
                Mot de passe oublié ?
              </span>
            </div>
          )}

          <button
            type="submit"
            className={`login_button ${loading ? "loading" : ""}`}
            disabled={loading}
          >
            {loading ? (
              <>
                {isLogin ? "Connexion" : "Inscription"}
                <span className="dots">...</span>
              </>
            ) : isLogin ? (
              "Se connecter"
            ) : (
              "Créer mon compte"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
