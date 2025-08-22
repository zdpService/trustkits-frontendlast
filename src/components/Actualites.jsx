import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAdmin } from "../context/context";
import "./Actualites.css";

const Actualites = () => {
  const { isAdmin } = useAdmin();
  const [actualites, setActualites] = useState([]);
  const [loading, setLoading] = useState(true);

  // Charger les actualités depuis Firebase
  useEffect(() => {
    const fetchActualites = async () => {
      const docRef = doc(db, "siteContent", "actualites");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setActualites(docSnap.data().items);
      } else {
        // Valeurs par défaut
        setActualites([
          {
            titre: "Grande Célébration Annuelle",
            description:
              "Rejoignez-nous pour notre grande célébration annuelle de la jeunesse !",
            image:
              "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSiYTUSKfUjnDd2v_bUi8y49y9lzJ0uZxHI5LmQlxRfsJrdjFOXrUGOE8TpbJ5OeF0uxPc&usqp=CAU",
          },
        ]);
      }
      setLoading(false);
    };
    fetchActualites();
  }, []);

  // Modifier les champs admin
  const handleChange = (index, field, value) => {
    const updated = [...actualites];
    updated[index][field] = value;
    setActualites(updated);
  };

  // Ajouter une actualité
  const handleAddActualite = () => {
    setActualites([
      ...actualites,
      { titre: "Nouvelle actualité", description: "", image: "" },
    ]);
  };

  // Sauvegarde dans Firebase
  const handleSave = async () => {
    await setDoc(doc(db, "siteContent", "actualites"), { items: actualites });
    alert("Actualités sauvegardées !");
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <section id="actualites" className="actualites-container">
      <h2 className="actualites-title">Actualités et Annonces</h2>

      {isAdmin && (
        <div className="admin-buttons">
          <button className="save-btn" onClick={handleSave}>
            Sauvegarder les modifications
          </button>
          <button className="add-btn" onClick={handleAddActualite}>
            Ajouter une actualité
          </button>
        </div>
      )}

      <Swiper
        modules={[Navigation, Pagination]}
        spaceBetween={30}
        slidesPerView={3}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          1024: { slidesPerView: 3 },
          768: { slidesPerView: 2 },
          320: { slidesPerView: 1 },
        }}
      >
        {actualites.map((item, index) => (
          <SwiperSlide key={index}>
            <div className="actualite-card">
              {isAdmin ? (
                <>
                  <input
                    type="text"
                    value={item.titre}
                    onChange={(e) =>
                      handleChange(index, "titre", e.target.value)
                    }
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
                    onChange={(e) =>
                      handleChange(index, "image", e.target.value)
                    }
                    placeholder="URL de l'image"
                  />
                </>
              ) : (
                <>
                  <img
                    src={item.image}
                    alt={item.titre}
                    className="actualite-image"
                  />
                  <div className="separator"></div>
                  <h3>{item.titre}</h3>
                  <p>{item.description}</p>
                </>
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default Actualites;
