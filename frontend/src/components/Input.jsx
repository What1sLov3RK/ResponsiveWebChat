import "../css/input.css";

const Input = ({ onChange, onKeyDown, value, type="text", className = "", placeholder=" " }) => {
  return (
    <input
      className={`${className} input-style`}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      type={type}
      value={value}
    />
  );
}

export default Input;