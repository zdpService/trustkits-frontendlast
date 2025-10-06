import "./SecondaryBtn.css";
import { Link } from "react-router-dom";

const SecondaryBtn = ({ to, children }) => {
  return (
    <Link to={to} className="secondary-btn">
      {children}
    </Link>
  );
};

export default SecondaryBtn;
