import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { auth, db } from "../firebase/config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth"; // <--- IMPORT IMPORTANT
import Loading from "../utilities/laoding/Loading";

const AdminRoute = ({ children }) => {
  const [role, setRole] = useState(null); // null = en cours de vérification
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // onAuthStateChanged attend que Firebase se connecte réellement
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (!user) {
          console.log(
            "🔴 AdminRoute: Pas d'utilisateur connecté détecté par l'écouteur."
          );
          setRole("guest");
          setLoading(false);
          return;
        }

        console.log("🟢 AdminRoute: Utilisateur détecté :", user.uid);

        // L'utilisateur est connecté, on vérifie son rôle dans Firestore
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          console.log("🧐 Rôle dans la DB :", userData.role);

          if (userData.role === "admin") {
            setRole("admin");
          } else {
            setRole("user");
          }
        } else {
          console.error("⚠️ Document utilisateur introuvable dans Firestore");
          setRole("user");
        }
      } catch (error) {
        console.error("❌ Erreur AdminRoute :", error);
        setRole("error");
      } finally {
        setLoading(false);
      }
    });

    // Nettoyage de l'écouteur quand le composant est démonté
    return () => unsubscribe();
  }, []);

  if (loading) return <Loading message="Vérification des droits Admin..." />;

  // Si c'est un admin, on laisse passer
  if (role === "admin") {
    return children;
  }

  // Si l'utilisateur est connecté mais pas admin, ou pas connecté du tout
  // On redirige vers /account pour éviter une boucle de redirection infinie vers login
  console.log("🚫 Accès refusé, redirection vers /account");
  return <Navigate to="/account" replace />;
};

export default AdminRoute;
