import React, { useEffect, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Navigation, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";
import { db } from "../firebase/config";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useAdmin } from "../context/context";
import "./VideoSlider.css";

const VideoSlider = () => {
  const { isAdmin } = useAdmin();
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState("");
  const [editing, setEditing] = useState(false);

  // Charger les vidéos depuis Firebase
  useEffect(() => {
    const fetchVideos = async () => {
      const docRef = doc(db, "siteContent", "videos");
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setVideos(docSnap.data().items);
      } else {
        setVideos([
          {
            id: 1,
            title: "Jour 1 - Conférence 2024",
            url: "https://www.youtube.com/embed/sAmxhw53hTA",
          },
          {
            id: 2,
            title: "Jour 2 - Conférence 2024",
            url: "https://www.youtube.com/embed/cmDhStjmtrE",
          },
          {
            id: 3,
            title: "Jour 3 - Conférence 2024",
            url: "https://www.youtube.com/embed/jpRAIlYXj64",
          },
          {
            id: 4,
            title: "Jour 4 - Conférence 2024",
            url: "https://www.youtube.com/watch?v=DWIE54dJ3PI",
          },
        ]);
      }
      setLoading(false);
    };
    fetchVideos();
  }, []);

  // Modifier les champs admin
  const handleChange = (index, field, value) => {
    const updated = [...videos];
    updated[index][field] = value;
    setVideos(updated);
  };

  // Ajouter une nouvelle vidéo
  const handleAddVideo = () => {
    setVideos([
      ...videos,
      { id: Date.now(), title: "Nouvelle vidéo", url: "" },
    ]);
    setEditing(true);
  };

  // Sauvegarder dans Firebase
  const handleSave = async () => {
    await setDoc(doc(db, "siteContent", "videos"), { items: videos });
    setFeedback("Modifications enregistrées !");
    setTimeout(() => setFeedback(""), 3000);
    setEditing(false);
  };

  if (loading) return <p>Chargement…</p>;

  return (
    <section id="videos" className="video-slider-section">
      <h1 className="video-title">Vidéos - Conférence 2024 : Le Réveil</h1>

      {isAdmin && !editing && (
        <div className="admin-buttons">
          <button className="save-btn" onClick={() => setEditing(true)}>
            Modifier les vidéos
          </button>
          <button className="add-btn" onClick={handleAddVideo}>
            Ajouter une vidéo
          </button>
        </div>
      )}

      {isAdmin && editing && (
        <div className="admin-buttons">
          <button className="save-btn" onClick={handleSave}>
            Sauvegarder les modifications
          </button>
          <button className="add-btn" onClick={handleAddVideo}>
            Ajouter une vidéo
          </button>
        </div>
      )}

      {feedback && (
        <p style={{ color: "green", textAlign: "center" }}>{feedback}</p>
      )}

      {isAdmin && editing ? (
        <div className="video-admin-list">
          {videos.map((video, index) => (
            <div className="video-admin-card" key={video.id}>
              {video.url && (
                <iframe
                  src={video.url}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
              )}
              <input
                type="text"
                value={video.title}
                onChange={(e) => handleChange(index, "title", e.target.value)}
                placeholder="Titre de la vidéo"
                className="input-video"
              />
              <input
                type="text"
                value={video.url}
                onChange={(e) => handleChange(index, "url", e.target.value)}
                placeholder="URL YouTube embed"
                className="input-video"
              />
            </div>
          ))}
        </div>
      ) : (
        <Swiper
          modules={[Autoplay, Navigation, Pagination]}
          spaceBetween={20}
          slidesPerView={1}
          navigation
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          loop={true}
          className="video-swiper"
        >
          {videos.map((video) => (
            <SwiperSlide key={video.id}>
              <div className="video-container">
                <iframe
                  src={video.url}
                  title={video.title}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                ></iframe>
                <h3 className="video-subtitle">{video.title}</h3>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
};

export default VideoSlider;
