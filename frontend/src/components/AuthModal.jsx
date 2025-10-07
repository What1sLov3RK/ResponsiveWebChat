import React from 'react';
import LogIn from "./LogIn";
import SignUp from "./SignUp";
import Modal from "./Modal";
const AuthModal = ({ onClose, isSignup, switchToSignup, switchToLogin }) => {
  return (
        <Modal>
        {isSignup ? (
          <SignUp onClose={onClose} switchToLogin={switchToLogin} />
        ) : (
          <LogIn onClose={onClose} switchToSignup={switchToSignup} />
        )}
        </Modal>
  );
}

export default AuthModal;