import React, { useRef, useEffect, useState } from "react";
import "./LoginModal.css";
import LoginForm from "./LoginForm";

const LoginModal = ({ isOpen, onClose, buttonRef }) => {
  const modalRef = useRef();
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    if (!isMobile && isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const modalWidth = 250;
      let leftPos = rect.left + window.scrollX;

      if (leftPos + modalWidth > window.innerWidth - 10) {
        leftPos = window.innerWidth - modalWidth - 10;
      }

      setPosition({
        top: rect.bottom + window.scrollY + 10,
        left: leftPos,
      });
    }
  }, [isOpen, buttonRef, isMobile]);

  if (!isOpen) return null;

  return (
    <div
      ref={modalRef}
      className={`modal-dropdown ${isMobile ? "mobile-mode" : "desktop-mode"}`}
      style={!isMobile ? { top: position.top, left: position.left } : {}}
    >
      <button className="close-btn" onClick={onClose}>
        &times;
      </button>
      <h4>Connexion</h4>
      <LoginForm />
    </div>
  );
};

export default LoginModal;
