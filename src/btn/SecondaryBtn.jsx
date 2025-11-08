import React from "react";
import { Link } from "react-router-dom";
import "./SecondaryBtn.css";

const SecondaryBtn = ({ to, children, onClick }) => {
  // S’il y a une prop `to`, on rend un <Link>, sinon un <button>
  const Component = to ? Link : "button";

  return (
    <Component to={to} onClick={onClick} className="secondary-btn">
      {children}
    </Component>
  );
};

export default SecondaryBtn;
