import React, { useEffect, useState } from "react";
import "./UserInfo.css";
import { getAuth, deleteUser } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

const UserInfos = () => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserInfo = async () => {
      const auth = getAuth();
      const user = auth.currentUser;

      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUserInfo(userDoc.data());
          } else {
            console.log("Aucune donnée utilisateur trouvée !");
          }
        } catch (error) {
          console.error("Erreur récupération données :", error);
        }
      }
      setLoading(false);
    };

    fetchUserInfo();
  }, []);

  const handleDeleteAccount = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) {
      alert("Aucun utilisateur connecté !");
      return;
    }

    const confirmation = window.confirm(
      "Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible."
    );
    if (!confirmation) return;

    try {
      // Supprimer document utilisateur dans Firestore
      await deleteDoc(doc(db, "users", user.uid));

      // Supprimer l’utilisateur de Firebase Auth
      await deleteUser(user);

      alert("Compte supprimé avec succès !");
      window.location.href = "/"; // rediriger vers l'accueil
    } catch (error) {
      console.error("Erreur lors de la suppression du compte :", error);
      if (error.code === "auth/requires-recent-login") {
        alert("Pour supprimer votre compte, reconnectez-vous et réessayez.");
      } else {
        alert("Erreur : " + error.message);
      }
    }
  };

  if (loading) {
    return <p>Chargement des informations...</p>;
  }

  if (!userInfo) {
    return <p>Aucune information disponible.</p>;
  }

  const userInfoData = [
    { label: "Nom Prénom", value: `${userInfo.nom} ${userInfo.prenom}` },
    { label: "Adresse e-mail", value: userInfo.email },
    { label: "Numéro de téléphone", value: userInfo.phone },
    {
      label: "Pays de résidence",
      value:
        userInfo.pays === "bj"
          ? "Bénin (+229)"
          : userInfo.pays === "ci"
          ? "Côte d’Ivoire (+225)"
          : userInfo.pays === "sn"
          ? "Sénégal (+221)"
          : "Autre",
    },
  ];

  return (
    <section>
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
            transform: "rotate(180deg)",
            fontWeight: "bold",
          }}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
          />
        </svg>
        <span style={{ fontWeight: "bold" }}>Utilisateur</span>
      </div>

      <div className="user_info">
        <table className="user_info_table">
          <tbody>
            {userInfoData.map((info, index) => (
              <tr key={index}>
                <td className="label">{info.label} :</td>
                <td className="value">{info.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <div>
          <button
            style={{
              background: "red",
              border: "none",
              display: "flex",
              alignItems: "center",
              fontWeight: "bold",
              color: "#ffffff",
              margin: "0.8rem 0",
              padding: "0.3rem 0.5rem",
              borderRadius: "8px",
              cursor: "pointer",
              gap: "0.3rem",
            }}
            onClick={handleDeleteAccount}
          >
            <span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                style={{
                  height: "25px",
                  width: "25px",
                  color: "#ffffff",
                }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                />
              </svg>
            </span>
            <span> Supprimer mon compte</span>
          </button>
        </div>
      </div>
    </section>
  );
};

export default UserInfos;
