import React from "react";
import Modal from "./Modal";
import LogIn from "./LogIn";
import SignUp from "./SignUp";

const AuthModal = ({ onClose, isSignup, switchToSignup, switchToLogin }) => {
  return (
    <Modal onClose={onClose} name={isSignup ? "Sign Up" : "Log In"}>
      {isSignup ? (
        <SignUp onClose={onClose} switchToLogin={switchToLogin} />
      ) : (
        <LogIn onClose={onClose} switchToSignup={switchToSignup} />
      )}
    </Modal>
  );
};

export default AuthModal;
