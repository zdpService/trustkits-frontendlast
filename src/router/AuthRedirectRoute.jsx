// src/routes/AuthRedirectRoute.jsx
import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loading from "../utilities/laoding/Loading"; // Assurez-vous que Loading est stylisé et rapide

const AuthRedirectRoute = ({ children, redirectTo = "/account" }) => {
  // Changez la valeur par défaut pour qu'elle pointe vers /account
  const [loadingInitialAuthCheck, setLoadingInitialAuthCheck] = useState(true); // Nouveau state
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsAuthenticated(!!user);
      setLoadingInitialAuthCheck(false); // L'authentification initiale est terminée
    });

    return () => unsubscribe();
  }, []);

  // Pendant que nous vérifions l'état initial d'authentification, ne rien rendre
  // ou afficher un simple loader en plein écran.
  if (loadingInitialAuthCheck) {
    return <Loading />; // Utilisez votre composant Loading ici pour couvrir l'écran
  }

  // Si l'utilisateur est connecté, rediriger immédiatement
  if (isAuthenticated) {
    return <Navigate to={redirectTo} replace />;
  }

  // Si l'utilisateur n'est PAS connecté, afficher le contenu enfant (LoginForm)
  return children;
};

export default AuthRedirectRoute;
