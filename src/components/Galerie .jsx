import React, { useEffect, useState } from "react";
import "./Galerie.css";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAdmin } from "../context/context";

const Galerie = () => {
  const { isAdmin } = useAdmin();
  const [galerie, setGalerie] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");

  // Charger les données depuis Firebase
  useEffect(() => {
    const fetchGalerie = async () => {
      const docRef = doc(db, "siteContent", "galerie");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setGalerie(docSnap.data().items);
      } else {
        setGalerie([
          {
            titre: "Service de Louange",
            description:
              "Un moment puissant de louange et d'adoration, animé par notre équipe dynamique.",
            image:
              "https://www.rccuba.org/wp-content/uploads/2025/06/WhatsApp-Image-2025-06-28-a-01.41.09_450da2ef-840x469.jpg",
          },
        ]);
      }
      setLoading(false);
    };

    fetchGalerie();
  }, []);

  // Modifier les champs pour admin
  const handleChange = (index, field, value) => {
    const updated = [...galerie];
    updated[index][field] = value;
    setGalerie(updated);
  };

  // Ajouter une nouvelle carte
  const handleAddGalerie = () => {
    setGalerie([
      ...galerie,
      { titre: "Nouvelle image", description: "", image: "" },
    ]);
  };

  // Sauvegarder dans Firebase
  const handleSave = async () => {
    await setDoc(doc(db, "siteContent", "galerie"), { items: galerie });
    setFeedback("Modifications enregistrées !");
    setTimeout(() => setFeedback(""), 3000);
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <section className="galerie-container" id="galerie">
      <h2 className="galerie-title">Notre Galerie</h2>

      {isAdmin && (
        <div className="admin-buttons">
          <button className="save-btn" onClick={handleSave}>
            Sauvegarder les modifications
          </button>
          <button className="add-btn" onClick={handleAddGalerie}>
            Ajouter une image/activité
          </button>
        </div>
      )}

      {feedback && (
        <p style={{ color: "green", textAlign: "center" }}>{feedback}</p>
      )}

      <div className="galerie-grid">
        {galerie.map((item, index) => (
          <div className="galerie-card" key={index}>
            {isAdmin ? (
              <>
                <input
                  type="text"
                  value={item.titre}
                  onChange={(e) => handleChange(index, "titre", e.target.value)}
                  placeholder="Titre"
                />
                <textarea
                  value={item.description}
                  onChange={(e) =>
                    handleChange(index, "description", e.target.value)
                  }
                  placeholder="Description"
                />
                <input
                  type="text"
                  value={item.image}
                  onChange={(e) => handleChange(index, "image", e.target.value)}
                  placeholder="URL de l'image"
                />
              </>
            ) : (
              <>
                <img
                  src={item.image}
                  alt={item.titre}
                  className="galerie-image"
                />
                <div className="galerie-content">
                  <h3>{item.titre}</h3>
                  <p>{item.description}</p>
                </div>
              </>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default Galerie;
