import React, { createContext, useState, useContext, useEffect } from "react";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "../firebase/config";

const GiftContext = createContext();

export const useGiftContext = () => {
  const context = useContext(GiftContext);
  if (!context) {
    throw new Error("useGiftContext must be used within GiftProvider");
  }
  return context;
};

export const GiftProvider = ({ children }) => {
  const [giftHistory, setGiftHistory] = useState([]);
  const [catalog, setCatalog] = useState([]); // ✅ ÉTAT DU CATALOGUE
  const [loading, setLoading] = useState(true);
  const [catalogLoading, setCatalogLoading] = useState(true); // ✅ LOADING CATALOGUE
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);

  const ordersCollection = collection(db, "orders");
  const catalogCollection = collection(db, "catalog");

  // ✅ ÉCOUTER L'HISTORIQUE DES COMMANDES
  useEffect(() => {
    setLoading(true);
    const q = query(ordersCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setGiftHistory(orders);
        setLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Erreur onSnapshot orders:", err);
        setError(err.message);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // ✅ ÉCOUTER LE CATALOGUE EN TEMPS RÉEL
  useEffect(() => {
    setCatalogLoading(true);
    const q = query(catalogCollection, orderBy("createdAt", "desc"));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        console.log("📦 Catalogue chargé:", items.length, "cadeaux");
        setCatalog(items);
        setCatalogLoading(false);
      },
      (err) => {
        console.error("❌ Erreur onSnapshot catalog:", err);
        setError(err.message);
        setCatalogLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // Ajouter une commande
  const addGift = async (giftData) => {
    try {
      const today = new Date();
      const formattedDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}/${String(today.getMonth() + 1).padStart(
        2,
        "0"
      )}/${today.getFullYear()}`;
      const formattedTrackingDate = `${String(today.getDate()).padStart(
        2,
        "0"
      )}-${String(today.getMonth() + 1).padStart(2, "0")}`;

      const newGift = {
        giftName: giftData.giftName,
        giftImage: giftData.giftImage,
        price: giftData.price,
        recipientName: `${giftData.recipientFirstName} ${giftData.recipientLastName}`,
        recipientFirstName: giftData.recipientFirstName,
        recipientLastName: giftData.recipientLastName,
        recipientCity: giftData.recipientCity,
        recipientCountry: giftData.recipientCountry,
        recipientPhone: giftData.recipientPhone,
        recipientAddress: giftData.recipientAddress,
        recipientEmail: giftData.recipientEmail,
        senderName: giftData.senderName,
        message: giftData.message || "",
        orderDate: formattedDate,
        status: "Validé",
        tracking: [
          {
            label: "COMMANDE EFFECTUÉE",
            date: formattedTrackingDate,
            completed: true,
          },
          {
            label: "PAIEMENT CONFIRMÉ",
            date: formattedTrackingDate,
            completed: true,
          },
          { label: "EN ATTENTE D'EXPÉDITION", date: "", completed: false },
          { label: "EN COURS D'EXPÉDITION", date: "", completed: false },
          { label: "PRÊT À RÉCUPÉRER", date: "", completed: false },
          { label: "COLIS LIVRÉ", date: "", completed: false },
        ],
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(ordersCollection, newGift);
      console.log("✅ Commande ajoutée avec ID:", docRef.id);
      return { id: docRef.id, ...newGift };
    } catch (error) {
      console.error("❌ Erreur addGift:", error);
      throw new Error("Erreur lors de l'enregistrement de la commande.");
    }
  };

  // ✅ Ajouter un cadeau au catalogue
  const addGiftToCatalog = async (giftData) => {
    try {
      const newCatalogItem = {
        name: giftData.name,
        category: giftData.category,
        price: giftData.price,
        image: giftData.image,
        createdAt: serverTimestamp(),
      };

      const docRef = await addDoc(catalogCollection, newCatalogItem);
      console.log("✅ Cadeau ajouté au catalogue avec ID:", docRef.id);
      return { id: docRef.id, ...newCatalogItem };
    } catch (error) {
      console.error("❌ Erreur addGiftToCatalog:", error);
      throw new Error("Impossible d'ajouter le cadeau au catalogue.");
    }
  };

  // Mettre à jour le statut d'une commande
  const updateOrderStatus = async (orderId, newTracking, newStatus) => {
    setUpdating(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await updateDoc(orderRef, {
        tracking: newTracking,
        status: newStatus,
      });

      setGiftHistory((prev) =>
        prev.map((order) =>
          order.id === orderId
            ? { ...order, tracking: newTracking, status: newStatus }
            : order
        )
      );
    } catch (err) {
      console.error("❌ Erreur updateOrderStatus:", err);
      setError("Impossible de mettre à jour le statut.");
      throw err;
    } finally {
      setUpdating(false);
    }
  };

  // Supprimer une commande
  const deleteGift = async (orderId) => {
    setLoading(true);
    try {
      const orderRef = doc(db, "orders", orderId);
      await deleteDoc(orderRef);
      setGiftHistory((prev) => prev.filter((order) => order.id !== orderId));
    } catch (err) {
      console.error("❌ Erreur deleteGift:", err);
      setError("Impossible de supprimer la commande.");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const contextValue = {
    giftHistory,
    catalog, // ✅ CATALOGUE EXPOSÉ
    loading,
    catalogLoading, // ✅ LOADING CATALOGUE EXPOSÉ
    error,
    updating,
    addGift,
    addGiftToCatalog,
    updateOrderStatus,
    deleteGift,
  };

  return (
    <GiftContext.Provider value={contextValue}>{children}</GiftContext.Provider>
  );
};
