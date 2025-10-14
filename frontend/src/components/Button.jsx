import "../css/button.css";

const Button = ({ name, onClick, className = "", type = "button", disabled }) => (
  <button type={type} className={className} onClick={onClick} disabled={disabled}>
    {name}
  </button>
);

export default Button;
