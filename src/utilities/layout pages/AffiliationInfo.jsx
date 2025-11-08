import React, { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import "./AffiliationInfo.css";
import Loading from "../../utilities/laoding/Loading"; // Nouveau composant Loading

const AffiliationInfo = () => {
  const [affiliationData, setAffiliationData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
          setLoading(false);
          return;
        }

        const data = userDoc.data();
        const affiliationLink =
          data.affiliation?.link ??
          `${window.location.origin}/login?mode=inscription&ref=${user.uid}`;

        const now = new Date();

        // Mettre à jour la dernière connexion
        await updateDoc(userRef, { lastLogin: now });

        setAffiliationData([
          {
            label: "Date d'inscription (UTC+0)",
            value: data.createdAt
              ? new Date(data.createdAt.seconds * 1000).toLocaleString()
              : now.toLocaleString(),
          },
          {
            label: "Dernière connexion (UTC+0)",
            value: now.toLocaleString(),
          },
          {
            label: "Lien d'affiliation personnel",
            value: (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <a
                  href={affiliationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="affiliation_link"
                  style={{
                    textDecoration: "underline",
                    color: "#0f172a",
                    fontWeight: "500",
                  }}
                >
                  {affiliationLink}
                </a>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  style={{
                    height: "20px",
                    width: "20px",
                    cursor: "pointer",
                    color: "#0f172a",
                    transition: "transform 0.2s",
                  }}
                  onClick={() => {
                    navigator.clipboard.writeText(affiliationLink);
                    alert("Lien copié !");
                  }}
                  onMouseOver={(e) =>
                    (e.currentTarget.style.transform = "scale(1.2)")
                  }
                  onMouseOut={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M8 16h8m-8-4h8m-8-4h8M4 20h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z"
                  />
                </svg>
              </div>
            ),
          },
          {
            label: "Nombre d'affiliés",
            value: data.affiliation?.nombreAffilies ?? 0,
          },
          {
            label: "Status du compte",
            value: (
              <span
                className={`status active`}
                style={{ color: "green", fontWeight: "bold" }}
              >
                Active
              </span>
            ),
          },
        ]);
      } catch (error) {
        console.error("Erreur récupération affiliation :", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // ⚡ Affichage du Loading
  if (loading) {
    return <Loading />;
  }

  if (!affiliationData.length) {
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Aucune information d’affiliation disponible.
      </p>
    );
  }

  return (
    <div>
      <div
        style={{
          padding: "20px",
          background: "#ffffff",
          borderBottom: "1.1px solid rgba(0, 0, 0, 0.3)",
          display: "flex",
          alignItems: "center",
          gap: "0.3rem",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          style={{
            height: "25px",
            width: "25px",
            color: "#0f172a",
            fontWeight: "bold",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z"
          />
        </svg>

        <span style={{ fontWeight: "bold" }}>Affiliation et Autres</span>
      </div>

      <div className="affiliation_info">
        <table className="affiliation_info_table">
          <tbody>
            {affiliationData.map((info, index) => (
              <tr key={index}>
                <td className="label">{info.label} :</td>
                <td className="value">{info.value}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AffiliationInfo;
