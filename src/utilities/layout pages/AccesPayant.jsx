import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./AccesPayant.css";
import Loading from "../laoding/Loading"; // ⚡ Vérifie le chemin

export const toolsData = [
  {
    title: "Envoi de faux virements",
    iconUrl: "https://store.provya.fr/img/cms/paiement-virement-bancaire.png",
    link: "/account/tools/virement-pro",
    status: "disponible",
  },
  {
    title: "Compte Flash Pro",
    iconUrl:
      "https://play-lh.googleusercontent.com/aegD6vfDyfLWnVLua0yi_FMxZ3fVtRIbiskvL7kJ3Vu23xQPR52x6QJAPIOjoCNw6tUY",
    link: "/account/tools/compte-flash-pro",
    status: "indisponible",
  },
  {
    title: "Numéros virtuels",
    iconUrl: "https://www.kitscms.com/res/img/telephone.png",
    link: "/account/tools/numeros-virtuels",
    status: "indisponible",
  },
  {
    title: "Vérification site web",
    iconUrl: "https://www.kitscms.com/res/img/whois.png",
    link: "/account/tools/verif-site",
    status: "indisponible",
  },
  {
    title: "SMS Pro",
    iconUrl: "https://www.kitscms.com/res/img/sms.png",
    link: "/account/tools/sms-pro",
    status: "indisponible",
  },
  {
    title: "Vérification IBAN / CB",
    iconUrl: "https://www.kitscms.com/res/img/rib.png",
    link: "/account/tools/iban-cb",
    status: "indisponible",
  },
];

const AccesPayant = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

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
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="toolsacces-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
          />
        </svg>
        <span>Outils à accès payant</span>
      </div>

      <div className="acces-payant">
        {toolsData.map((tool, index) => (
          <div
            key={index}
            className={`acces-item ${
              tool.status === "indisponible" ? "unavailable" : ""
            }`}
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
