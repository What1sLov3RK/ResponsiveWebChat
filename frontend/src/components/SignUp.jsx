import React, { useState } from "react";
import "../css/modal.css";
import Input from "./Input";
import Button from "./Button";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import chatStore from "../stores/chatStore";
import api from "../api";

const SignUp = ({ onClose, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [firstname, setFirstname] = useState("");
  const [lastname, setLastname] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSelectedChat, fetchChats } = chatStore;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const payload = { email, firstname, lastname, password };
      const res = await api.post("/users/registration", payload);

      if (res?.error) {
        showErrorToast(res.error);
        return;
      }

      showSuccessToast("Account created successfully! 🎉");

      setSelectedChat(null);
      setTimeout(() => {
  chatStore.initSocket();
}, 500);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({ firstname, lastname, email })
      );
      await new Promise((r) => setTimeout(r, 100));

      await fetchChats();
      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      const status = error.response?.status;

      if (status === 409) {
        showErrorToast("User with this email already exists");
      } else if (Array.isArray(res?.details)) {
        showErrorToast("Validation failed", res.details);
      } else {
        showErrorToast(res?.error || "Registration failed");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} method="POST" noValidate>
      <div className="input-container">
        <label>Email:</label>
        <Input
          type="email"
          name="email"
          id="signup-email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoFocus
        />
      </div>

      <div className="input-container">
        <label>First name:</label>
        <Input
          type="text"
          name="firstname"
          id="signup-firstname"
          autoComplete="given-name"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          placeholder="Enter your first name"
          required
        />
      </div>

      <div className="input-container">
        <label>Last name:</label>
        <Input
          type="text"
          name="lastname"
          id="signup-lastname"
          autoComplete="family-name"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          placeholder="Enter your last name"
          required
        />
      </div>

      <div className="input-container">
        <label>Password:</label>
        <Input
          type="password"
          name="password"
          id="signup-password"
          autoComplete="new-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter your password"
          minLength={8}
          required
        />
      </div>

      <div className="change-modal-buttons-container">
        <Button
          type="submit"
          name={loading ? "Signing Up..." : "Sign Up"}
          disabled={loading}
        />
        <Button
          type="button"
          name="Log In"
          onClick={switchToLogin}
          disabled={loading}
          className="secondary-button"
        />
      </div>
    </form>
  );
};

export default SignUp;
