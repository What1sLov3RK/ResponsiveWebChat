import React from "react";
import { toast } from "react-toastify";

/**
 * Shows a grouped error toast or a single error toast.
 * @param {string} error - The main error message.
 * @param {string[]} [details] - Optional list of detailed errors.
 */
export const showErrorToast = (error, details = []) => {
  if (Array.isArray(details) && details.length > 0) {
    toast.error(
      <div>
        <div style={{ fontWeight: "bold", marginBottom: "4px" }}>
          {error || "An error occurred"}
        </div>
        <ul
          style={{
            margin: "0",
            padding: "0 0 0 16px",
            fontSize: "0.9em",
            listStyleType: "disc",
          }}
        >
          {details.map((msg, idx) => (
            <li key={idx} style={{ marginBottom: "2px" }}>
              {msg}
            </li>
          ))}
        </ul>
      </div>,
      {
        autoClose: 5000,
      }
    );
  } else if (error) {
    toast.error(error);
  }
};

/**
 * Shows a success toast.
 * @param {string} message - The success message.
 */
export const showSuccessToast = (message) => {
  toast.success(message);
};

/**
 * Shows an info toast.
 * @param {string} message - The info message.
 * @param {object} [options] - Optional toast options.
 */
export const showInfoToast = (message, options = {}) => {
  toast.info(message, options);
};
