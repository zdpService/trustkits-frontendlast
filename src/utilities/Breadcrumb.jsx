import React from "react";
import { Link } from "react-router-dom";

const Breadcrumb = ({ items = [] }) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "0.6rem",
        background: "#ffffff",
        padding: "1rem",
      }}
    >
      {items.map((item, index) => (
        <React.Fragment key={index}>
          <span style={{ display: "flex", alignItems: "center" }}>
            {item.icon && (
              <span style={{ marginRight: "0.3rem" }}>{item.icon}</span>
            )}
            {item.link ? (
              <Link
                to={item.link}
                style={{
                  fontSize: "16px",
                  fontFamily: "Righteous",
                  fontWeight: index === items.length - 1 ? "400" : "400",
                  opacity: index === items.length - 1 ? "1" : "0.8",
                  textDecoration: "none",
                  color: "#0f172a",
                }}
              >
                {item.label}
              </Link>
            ) : (
              <span
                style={{
                  fontSize: "16px",
                  fontFamily: "Righteous",
                  fontWeight: index === items.length - 1 ? "600" : "400",
                  opacity: index === items.length - 1 ? "1" : "0.8",
                }}
              >
                {item.label}
              </span>
            )}
          </span>

          {/* Flèche entre les éléments sauf le dernier */}
          {index < items.length - 1 && (
            <span style={{ margin: "0 0.5rem" }}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                style={{ height: "20px", width: "20px", color: "#0f172a" }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m8.25 4.5 7.5 7.5-7.5 7.5"
                />
              </svg>
            </span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default Breadcrumb;
