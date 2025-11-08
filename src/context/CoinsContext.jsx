// src/context/CoinsContext.jsx

import React, { createContext, useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { signOut } from "firebase/auth"; // 👈 Import de signOut

export const CoinsContext = createContext();

// 🔑 Liste des clés du Local Storage à nettoyer lors de la déconnexion
const KEYS_TO_CLEAR_ON_LOGOUT = [
  "vantex_user", // La clé de l'utilisateur principal (si vous l'utilisez)
  "authtrue",
  "authToken",
  "user_authenticated",
  "betHistory",
  "cart",
  "crashState",
  "flashClientAccesses", // 👈 Très important pour la déconnexion Pro
  "recentlyViewedProducts",
  "walletAmount",
  // Ajoutez ici toute autre clé d'état qui ne doit pas persister
];

export const CoinsProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  // ... (Fonctions loadCoins, updateCoins, refreshCoins - Inchangé)
  const loadCoins = useCallback(async (uid) => {
    // ... (Logique loadCoins inchangée)
    try {
      const docRef = doc(db, "users", uid);
      const docSnap = await getDoc(docRef);

      setCoins(docSnap.exists() ? docSnap.data().coins || 0 : 0);
    } catch (error) {
      console.error("Erreur chargement coins :", error);
      setCoins(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateCoins = useCallback(async (uid, newCoins) => {
    // ... (Logique updateCoins inchangée)
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { coins: newCoins });
      setCoins(newCoins);
    } catch (error) {
      console.error("Erreur mise à jour coins :", error);
    }
  }, []);

  const refreshCoins = useCallback(async () => {
    // ... (Logique refreshCoins inchangée)
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);

      const res = await fetch(
        "https://trust-kits-backend.onrender.com/api/paiement/fusion-verify",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ uid: user.uid }),
        }
      );

      const data = await res.json();
      if (data.success) {
        setCoins(data.newWallet || 0);
        await updateCoins(user.uid, data.newWallet || 0);
      }
    } catch (error) {
      console.error("Erreur rafraîchissement coins :", error);
    } finally {
      setLoading(false);
    }
  }, [updateCoins]);

  // 🚀 FONCTION DE DÉCONNEXION CENTRALISÉE ET NETTOYÉE
  const fullLogout = useCallback(async (navigateCallback) => {
    try {
      // 1. Déconnexion de Firebase Auth
      await signOut(auth);

      // 2. Nettoyage de l'état React des coins
      setCoins(0);
      setLoading(false);

      // 3. Nettoyage du Local Storage (le plus important pour vos problèmes)
      KEYS_TO_CLEAR_ON_LOGOUT.forEach((key) => {
        localStorage.removeItem(key);
      });

      console.log("Logout: Firebase déconnecté. Local Storage nettoyé.");

      // 4. Redirection (via React Router)
      if (navigateCallback) {
        navigateCallback("/");
      }

      // 5. Forcer le rechargement de la page pour réinitialiser tous les états globaux
      window.location.reload();
    } catch (error) {
      console.error("Erreur lors de la déconnexion complète :", error);
    }
  }, []);

  // Sur changement d’état d’authentification
  useEffect(() => {
    // ... (Logique onAuthStateChanged inchangée)
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        loadCoins(user.uid);
      } else {
        setCoins(0);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, [loadCoins]);

  return (
    <CoinsContext.Provider
      value={{
        coins,
        setCoins,
        updateCoins,
        loading,
        refreshCoins,
        loadCoins,
        fullLogout,
      }}
    >
      {children}
    </CoinsContext.Provider>
  );
};

// ⚠️ Note: Le contexte MenuContext n'a pas besoin d'être modifié, il est indépendant.
