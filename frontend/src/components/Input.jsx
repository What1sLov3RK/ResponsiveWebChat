import React, { forwardRef } from 'react';
import "../css/input.css";

const Input = forwardRef(({ onChange, onKeyDown, value, type="text", className = "", placeholder=" ", ...rest }, ref) => {
  return (
    <input
      ref={ref}
      className={`${className} input-style`}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      type={type}
      value={value}
      {...rest}
    />
  );
});

export default Input;