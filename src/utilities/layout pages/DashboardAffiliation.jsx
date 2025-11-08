import React, { useEffect, useState } from "react";
import "./DashboardAffiliation.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import {
  doc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import Loading from "../laoding/Loading";

const DashboardAffiliation = () => {
  const [telephone, setTelephone] = useState("");
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [historique, setHistorique] = useState([]);
  // Initialisation à 0, sera écrasée par la valeur du document
  const [nombreAffilies, setNombreAffilies] = useState(0);

  useEffect(() => {
    const auth = getAuth();

    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setLoading(false);
        setUserData(null);
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUserData(data);

          // 🎯 NOUVELLE METHODE : Utilisation de la valeur statique du document utilisateur
          // pour s'aligner sur la méthode d'affichage de AffiliationInfo.
          const nombreAffiliesStatique = data.affiliation?.nombreAffilies ?? 0;
          setNombreAffilies(nombreAffiliesStatique);

          // Récupération de l'historique
          const retraitCol = collection(
            db,
            "users",
            user.uid,
            "historiqueRetraits"
          );
          const retraitSnap = await getDocs(retraitCol);
          const retraitList = retraitSnap.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setHistorique(retraitList);
        }
      } catch (error) {
        console.error("Erreur récupération données :", error);
      }

      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleRetrait = async () => {
    if (!telephone) {
      alert("Veuillez entrer un numéro de téléphone.");
      return;
    }

    const auth = getAuth();
    const user = auth.currentUser;

    if (!user || !userData) return;

    try {
      const retraitRef = collection(
        db,
        "users",
        user.uid,
        "historiqueRetraits"
      );
      await addDoc(retraitRef, {
        montant: userData.gains || 0,
        numero: telephone,
        date: new Date().toLocaleString(),
        moyen: "Mobile Money",
      });

      const userRef = doc(db, "users", user.uid);
      // Mise à jour des gains et retraits dans Firestore
      await updateDoc(userRef, {
        gains: 0,
        retraits: (userData.retraits || 0) + (userData.gains || 0),
      });

      alert("Retrait effectué !");
      setTelephone("");
      // Mise à jour de l'état local après le retrait
      setUserData({
        ...userData,
        gains: 0,
        retraits: (userData.retraits || 0) + (userData.gains || 0),
      });

      // Re-récupération de l'historique après le retrait
      const retraitSnap = await getDocs(
        collection(db, "users", user.uid, "historiqueRetraits")
      );
      setHistorique(
        retraitSnap.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      );
    } catch (error) {
      console.error("Erreur retrait :", error);
      alert("Erreur lors du retrait. Veuillez réessayer.");
    }
  };

  if (loading) return <Loading />;

  if (!userData)
    return (
      <p style={{ textAlign: "center", marginTop: "20px" }}>
        Aucune donnée disponible.
      </p>
    );

  // Génération du lien d'affiliation
  const affiliationLink =
    userData.affiliation?.link ||
    `${window.location.origin}/login?mode=inscription&ref=${
      getAuth().currentUser?.uid
    }`;

  return (
    <section className="dashboard-affiliation">
      <div className="dashboard-header">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="header-icon"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M12 7.5h1.5m-1.5 3h1.5m-7.5 3h7.5m-7.5 3h7.5m3-9h3.375c.621 0 1.125.504 1.125 1.125V18a2.25 2.25 0 0 1-2.25 2.25M16.5 7.5V18a2.25 2.25 0 0 0 2.25 2.25M16.5 7.5V4.875c0-.621-.504-1.125-1.125-1.125H4.125C3.504 3.75 3 4.254 3 4.875V18a2.25 2.25 0 0 0 2.25 2.25h13.5M6 7.5h3v3H6v-3Z"
          />
        </svg>
        <span className="dashboard-title">Lien de parrainage</span>
      </div>

      <div className="dashboard-content">
        <p className="dashboard-description">
          Parrainer sur Kitscms, c'est gagner <strong>10%</strong> sur chaque
          dépôt effectué par vos filleuls. Partagez votre lien de parrainage
          pour augmenter vos gains. Retirez vos gains instantanément via Mobile
          Money ou transférez-les vers votre balance Kitscms.
        </p>

        <div className="lien-parrainage">
          <a href={affiliationLink} target="_blank" rel="noopener noreferrer">
            {affiliationLink}
          </a>
        </div>

        <div className="stats-affiliation">
          <div className="stat-item">
            <span>Total Gain(s) disponible :</span>
            <strong>{userData.gains || 0} F CFA</strong>
          </div>
          <div className="stat-item">
            <span>Total Retrait(s) effectué(s) :</span>
            <strong>{userData.retraits || 0} F CFA</strong>
          </div>
          <div className="stat-item">
            <span>Nombre Total des affiliés :</span>
            {/* Affichage de l'état nombreAffilies (qui est maintenant la valeur statique) */}
            <strong>{nombreAffilies}</strong>
          </div>
        </div>

        <div className="retrait-section">
          <h2>Retrait de vos gains par Mobile Money</h2>
          <label>Choisissez un moyen de retrait :</label>
          <select>
            <option value="orange-money">Orange Money</option>
            <option value="mtn-money">MTN Money</option>
          </select>

          <label>Numéro de téléphone :</label>
          <input
            type="text"
            placeholder="Numéro à 8 chiffres ou plus"
            value={telephone}
            onChange={(e) => setTelephone(e.target.value)}
          />

          <button className="btn-retrait" onClick={handleRetrait}>
            Retirer mes gains
          </button>
        </div>

        <div className="historique-section">
          <h2>Historique de vos retraits</h2>
          {historique.length === 0 ? (
            <p>Aucun retrait effectué.</p>
          ) : (
            <ul>
              {historique.map((item) => (
                <li key={item.id}>
                  {item.date} — {item.montant} F CFA — {item.moyen} (
                  {item.numero})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </section>
  );
};

export default DashboardAffiliation;
