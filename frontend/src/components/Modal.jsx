import React from "react";
import { createPortal } from "react-dom";
import "../css/modal.css";

const modalRoot = document.getElementById("modal-root");

const Modal = ({ onClose, children, name, footer, showCloseIcon = true }) => {
  if (!modalRoot) return null;

  return createPortal(
    <div
      className="modal-overlay"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        role="document"
      >
        <div className="modal-header">
          {name && <h2 className="modal-name">{name}</h2>}
          {showCloseIcon && (
            <button
              type="button"
              className="modal-close-icon"
              onClick={onClose}
              aria-label="Close"
            >
              &times;
            </button>
          )}
        </div>
        <div className="modal-body">{children}</div>
        {footer && <div className="modal-footer">{footer}</div>}
      </div>
    </div>,
    modalRoot
  );
};

export default Modal;
