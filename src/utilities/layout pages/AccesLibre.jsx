import React, { useState } from "react";
import "./AccesLibre.css"; // Assurez-vous que ce fichier CSS existe et contient les styles pour .unavailable et .status-tag
import Loading from "../laoding/Loading"; // ⚡ Vérifie le chemin

export const libreData = [
  {
    title: "Recherche Whois",
    iconUrl: "https://www.kitscms.com/res/img/whois.png",
    link: "https://example.com/whois",
    status: "indisponible", // Ajout du statut
  },
  {
    title: "Générateur d’IBAN",
    iconUrl: "https://www.kitscms.com/res/img/rib.png",
    link: "https://example.com/generateur-iban",
    status: "indisponible", // Ajout du statut
  },
  {
    title: "Test SMS Gratuit",
    iconUrl: "https://www.kitscms.com/res/img/sms.png",
    link: "https://example.com/sms-gratuit",
    status: "indisponible", // Exemple d'outil indisponible
  },
  {
    title: "Scanner de site",
    iconUrl: "https://www.kitscms.com/res/img/telephone.png",
    link: "https://example.com/scanner-site",
    status: "indisponible", // Ajout du statut
  },
];

const AccesLibre = () => {
  const [loading, setLoading] = useState(false);
  const [targetLink, setTargetLink] = useState("");

  const handleToolClick = (tool) => {
    // La fonction prend maintenant l'objet 'tool' en entier
    if (tool.status === "indisponible") {
      alert(`❌ L'outil "${tool.title}" est actuellement indisponible.`);
      return;
    }

    setLoading(true);
    setTargetLink(tool.link); // Utilise tool.link

    setTimeout(() => {
      setLoading(false);
      window.location.href = tool.link; // 🔗 Redirection externe
    }, 3000); // ⏳ Loading de 3 secondes
  };

  if (loading) {
    return <Loading />;
  }

  return (
    <div className="toolsacces">
      {/* Header */}
      <div className="toolsacces-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{
            height: "20px",
            width: "20px",
            color: "#0f172a",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="m6.75 7.5 3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0 0 21 18V6a2.25 2.25 0 0 0-2.25-2.25H5.25A2.25 2.25 0 0 0 3 6v12a2.25 2.25 0 0 0 2.25 2.25Z"
          />
        </svg>

        <span>Outils à accès libre</span>
      </div>

      {/* Grid d’outils */}
      <div className="acces-payant">
        {" "}
        {/* Réutilise la classe acces-payant pour la grille */}
        {libreData.map((tool, index) => (
          <div
            key={index}
            className={`acces-item ${
              tool.status === "indisponible" ? "unavailable" : ""
            }`}
            onClick={() => handleToolClick(tool)} // Passe l'objet tool entier
            style={{
              cursor:
                tool.status === "indisponible" ? "not-allowed" : "pointer",
            }}
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

export default AccesLibre;
