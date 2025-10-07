import "../css/button.css";

const Button= ({ name, onClick, className, type="text"}) => {
  return (
    <button className={className} onClick={onClick} type={type}>
      {name}
    </button>
  );
}

export default Button;