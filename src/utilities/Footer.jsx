import "./Footer.css";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-logo">
          <h2>CMA-CI</h2>
          <p>Coordination Nationale des Flambeaux-Lumières</p>
        </div>

        <nav className="footer-nav">
          <Link to="#apropos">À Propos</Link>
          <Link to="#activites">Activités</Link>
          <Link to="#contact">Contact</Link>
          <Link to="#publications">Publications</Link>
        </nav>

        <div className="footer-social">
          <Link to="#">
            <img
              src="https://img.icons8.com/ios-filled/20/ffffff/facebook--v1.png"
              alt="Facebook"
            />
          </Link>
          <Link to="#">
            <img
              src="https://img.icons8.com/ios-filled/20/ffffff/instagram-new.png"
              alt="Instagram"
            />
          </Link>
          <Link to="#">
            <img
              src="https://img.icons8.com/ios-filled/20/ffffff/youtube-play.png"
              alt="YouTube"
            />
          </Link>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © 2025 Coordination Nationale Des Flambeaux-Lumières CMA CI. Tous
          droits réservés.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
