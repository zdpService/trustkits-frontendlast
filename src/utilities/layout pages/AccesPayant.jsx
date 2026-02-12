import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
// Ajoute tes imports Firebase ici (ajuste le chemin selon ton projet)
import { auth, db } from "../../firebase/config"; 
import { doc, getDoc } from "firebase/firestore";
import "./AccesPayant.css";
import Loading from "../laoding/Loading";

// 1. AJOUT DES "id" POUR FAIRE LE LIEN AVEC L'ADMIN
export const toolsData = [
  {
    id: "virement_pro", // NOUVEAU
    title: "Envoi de faux virements",
    iconUrl: "https://store.provya.fr/img/cms/paiement-virement-bancaire.png",
    link: "/account/tools/virement-pro",
    status: "disponible", // Statut par défaut
  },
  {
    id: "compte_flash_pro", // NOUVEAU
    title: "Compte Flash Pro",
    iconUrl: "https://www.flashbank.lk/wp-content/uploads/2020/05/512x512bb-512x300.jpg",
    link: "/account/tools/compte-flash-pro",
    status: "disponible",
  },
  {
    id: "gift_send", // NOUVEAU
    title: "Envoie de cadeau",
    iconUrl: "https://static.yoursurprise.com/bndr/m/4112053ae68ccfa4/original/category-thank-you.png?canvas=1:1&bg-color=F5ECE6&format=jpg&width=248",
    link: "/account/tools/envoie-de-cadeau",
    status: "disponible",
  },
  {
    id: "numeros_virtuels", // NOUVEAU
    title: "Numéros virtuels",
    iconUrl: "https://www.kitscms.com/res/img/telephone.png",
    link: "/account/tools/numeros-virtuels",
    status: "indisponible",
  },
  {
    id: "achat_compte_flash", // NOUVEAU
    title: "Achat de compte Flash",
    iconUrl: "https://s.france24.com/media/display/210e575c-cda9-11ef-94bb-005056a90284/w:1280/p:16x9/4banques-main.jpg",
    link: "/account/tools/achat-compte-flash",
    status: "disponible",
  },
  {
    id: "verification_iban", // NOUVEAU
    title: "Vérification IBAN / CB",
    iconUrl: "https://cdn-icons-png.flaticon.com/256/8032/8032096.png",
    link: "/account/tools/Sms-pro",
    status: "disponible",
  },
];

const AccesPayant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState(null);

  // 2. RÉCUPÉRER LES SETTINGS DE L'UTILISATEUR CONNECTÉ
  useEffect(() => {
    const fetchUserSettings = async () => {
      // S'assurer que l'utilisateur est connecté
      const currentUser = auth.currentUser;
      if (currentUser) {
        try {
          const docRef = doc(db, "users", currentUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setUserData(docSnap.data());
          }
        } catch (error) {
          console.error("Erreur lors de la récupération des données", error);
        }
      }
    };

    fetchUserSettings();
  }, []);

  // 3. COMBINER LE TABLEAU PAR DÉFAUT AVEC LES CHOIX DE L'ADMIN
  const dynamicTools = toolsData.map((tool) => {
    const userSettings = userData?.serviceSettings?.[tool.id];
    
    // Si l'admin a explicitement refusé l'accès ("allowed" est false)
    if (userSettings && userSettings.allowed === false) {
      return { ...tool, status: "indisponible" };
    }
    // Si l'admin a explicitement autorisé l'accès ("allowed" est true), même si par défaut c'était indisponible
    if (userSettings && userSettings.allowed === true) {
      return { ...tool, status: "disponible" };
    }
    
    // Sinon, on garde le statut par défaut
    return tool;
  });

  const handleToolClick = (tool) => {
    if (tool.status === "indisponible") {
      alert(`❌ L'outil "${tool.title}" est actuellement indisponible.`);
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      navigate(tool.link);
    }, 3000); // ⏳ Loading de 3 secondes
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="toolsacces">
      <div className="toolsacces-header">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="toolsacces-icon">
          <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
        </svg>
        <span>Outils à accès payant</span>
      </div>

      <div className="acces-payant">
        {/* On utilise dynamicTools au lieu de toolsData */}
        {dynamicTools.map((tool, index) => (
          <div
            key={index}
            className={`acces-item ${tool.status === "indisponible" ? "unavailable" : ""}`}
            onClick={() => handleToolClick(tool)}
          >
            <img src={tool.iconUrl} alt={tool.title} />
            <h2>{tool.title}</h2>
            {tool.status === "indisponible" && (
              <span className="status-tag">Indisponible</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccesPayant;