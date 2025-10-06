// src/components/ModalVideo/ModalVideo.jsx

import React from "react";
import "./ModalVideo.css"; // Toujours utiliser le même fichier CSS

const ModalVideo = ({
  isOpen,
  onClose,
  videoSource,
  title = "Vidéo de test",
  isLocal = false,
}) => {
  if (!isOpen) return null;

  const renderVideoContent = () => {
    if (isLocal) {
      // Pour une vidéo locale (fichier MP4, etc.)
      return (
        <video width="100%" height="auto" controls autoPlay>
          <source src={videoSource} type="video/mp4" />
          Votre navigateur ne supporte pas la balise vidéo.
        </video>
      );
    } else {
      // Pour une vidéo YouTube (ou une URL externe déjà intégrée)
      return (
        <iframe
          width="100%"
          height="315"
          src={videoSource}
          title={title}
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      );
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button className="close-button" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">{renderVideoContent()}</div>
      </div>
    </div>
  );
};

export default ModalVideo;
