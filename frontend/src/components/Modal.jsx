import React from "react";
import { createPortal } from "react-dom";
import "../css/modal.css";

const modalRoot = document.getElementById("modal-root");

const Modal = ({ onClose, children, name }) => {
  if (!modalRoot) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={(e) => {
        e.stopPropagation();
        onClose?.();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        {name ? <h2 className="modal-name">{name}</h2> : null}
        {children}
        <button
          type="button"
          className="modal-close-button"
          onClick={onClose}
        >
          Close
        </button>
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
