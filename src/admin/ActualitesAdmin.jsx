import React, { useState, useEffect } from "react";
import { useAdmin } from "../context/AdminContext";
import { db } from "../firebase"; // ton Firebase config
import { collection, getDocs, updateDoc, doc } from "firebase/firestore";
import "./ActualitesAdmin.css";

const ActualitesAdmin = () => {
  const { isAdmin } = useAdmin();
  const [actualites, setActualites] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [formData, setFormData] = useState({
    titre: "",
    description: "",
    image: "",
  });

  // Récupère les données depuis Firebase
  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "actualites"));
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setActualites(data);
    };
    fetchData();
  }, []);

  const handleEdit = (index) => {
    setEditingIndex(index);
    setFormData({
      titre: actualites[index].titre,
      description: actualites[index].description,
      image: actualites[index].image,
    });
  };

  const handleSave = async (id) => {
    const docRef = doc(db, "actualites", id);
    await updateDoc(docRef, formData);
    const newActualites = [...actualites];
    newActualites[editingIndex] = { id, ...formData };
    setActualites(newActualites);
    setEditingIndex(null);
  };

  return (
    <section className="actualites-container">
      <h2>Actualités et Annonces</h2>
      {actualites.map((item, index) => (
        <div key={item.id} className="actualite-card">
          {editingIndex === index ? (
            <div className="edit-form">
              <input
                value={formData.titre}
                onChange={(e) =>
                  setFormData({ ...formData, titre: e.target.value })
                }
                placeholder="Titre"
              />
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                placeholder="Description"
              />
              <input
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                placeholder="URL Image"
              />
              <button onClick={() => handleSave(item.id)}>Enregistrer</button>
              <button onClick={() => setEditingIndex(null)}>Annuler</button>
            </div>
          ) : (
            <div className="card-content">
              <img src={item.image} alt={item.titre} />
              <h3>{item.titre}</h3>
              <p>{item.description}</p>
              {isAdmin && (
                <button className="edit-btn" onClick={() => handleEdit(index)}>
                  Modifier
                </button>
              )}
            </div>
          )}
        </div>
      ))}
    </section>
  );
};

export default ActualitesAdmin;
