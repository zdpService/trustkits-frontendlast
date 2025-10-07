import React from "react";
import { Link } from "react-router-dom";
import "./PrimaryBtn.css";

const PrimaryBtn = ({ to, children, onClick }) => {
  // Rend un <Link> si la prop `to` est fournie, sinon un <button>
  const Component = to ? Link : "button";

  return (
    <Component to={to} onClick={onClick} className="primary-btn">
      {children}
    </Component>
  );
};

export default PrimaryBtn;
