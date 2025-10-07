import React from "react";
import Button from "./Button";
import "../css/modal.css";

const Modal = ({ onClose, children, name }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2 className="modal-name">{name}</h2>
        {children}
        <Button
          name="Close"
          onClick={onClose}
          className="modal-close-button"
        />
      </div>
    </div>
  );
};

export default Modal;
