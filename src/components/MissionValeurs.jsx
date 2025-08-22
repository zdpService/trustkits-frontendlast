import React, { useEffect, useState } from "react";
import { db } from "../firebase/config"; // ton fichier firebase.js
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAdmin } from "../context/context"; // contexte admin
import "./MissionValeurs.css";

const MissionValeurs = () => {
  const { isAdmin } = useAdmin();
  const [mission, setMission] = useState({ content: "" });
  const [loading, setLoading] = useState(true);

  // Charger les données depuis Firebase
  useEffect(() => {
    const fetchMission = async () => {
      const docRef = doc(db, "siteContent", "mission");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setMission(docSnap.data());
      } else {
        setMission({
          content:
            "La Coordination Nationale des Flambeaux-lumières CMA CI a pour mission de former la jeunesse à devenir des leaders chrétiens inspirants, enracinés dans les valeurs bibliques...",
        });
      }
      setLoading(false);
    };
    fetchMission();
  }, []);

  // Sauvegarder les modifications dans Firebase
  const handleSave = async () => {
    await setDoc(doc(db, "siteContent", "mission"), mission);
    alert("Mission sauvegardée !");
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <section className="mission-container" id="mission-section ">
      <div className="mission-content">
        <h2>Notre Mission et Nos Valeurs</h2>

        {isAdmin ? (
          <>
            <textarea
              value={mission.content}
              onChange={(e) => setMission({ content: e.target.value })}
              className="mission-textarea"
              placeholder="Texte de la mission"
            />
            <button onClick={handleSave} className="save-btn">
              💾 Sauvegarder
            </button>
          </>
        ) : (
          <p>{mission.content}</p>
        )}
      </div>
    </section>
  );
};

export default MissionValeurs;
