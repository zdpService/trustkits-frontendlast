import React, { createContext, useState, useEffect, useCallback } from "react";
import { auth, db } from "../firebase/config";
import { doc, getDoc, updateDoc } from "firebase/firestore";

export const CoinsContext = createContext();

export const CoinsProvider = ({ children }) => {
  const [coins, setCoins] = useState(0);
  const [loading, setLoading] = useState(true);

  // Charger les coins depuis Firebase
  const loadCoins = useCallback(async (uid) => {
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

  // Mettre à jour les coins dans Firebase et localement
  const updateCoins = useCallback(async (uid, newCoins) => {
    try {
      const docRef = doc(db, "users", uid);
      await updateDoc(docRef, { coins: newCoins });
      setCoins(newCoins);
    } catch (error) {
      console.error("Erreur mise à jour coins :", error);
    }
  }, []);

  // Rafraîchir les coins depuis le backend (FusionPay)
  const refreshCoins = useCallback(async () => {
    try {
      const user = auth.currentUser;
      if (!user) return;

      setLoading(true);

      const res = await fetch(
        "http://localhost:5000/api/paiement/fusion-verify",
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

  // Sur changement d’état d’authentification
  useEffect(() => {
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
      value={{ coins, setCoins, updateCoins, loading, refreshCoins, loadCoins }}
    >
      {children}
    </CoinsContext.Provider>
  );
};
