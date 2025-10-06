import { useNavigate } from "react-router-dom";
import "./PrimaryBtn.css";

const PrimaryBtn = ({ children, onClick, to }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button onClick={handleClick} className="primary-btn">
      {children}
    </button>
  );
};

export default PrimaryBtn;
