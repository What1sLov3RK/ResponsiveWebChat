import React, { useState } from "react";
import "../css/modal.css";
import Input from "./Input";
import Button from "./Button";
import api from "../api";
import { showErrorToast, showSuccessToast } from "../utils/toastHelper";
import chatStore from "../stores/chatStore";

const LogIn = ({ onClose, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setSelectedChat, fetchChats } = chatStore;

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (loading) return;

    setLoading(true);
    try {
      const payload = { email, password };
      const res = await api.post("/users/login", payload);

      if (res?.error) {
        showErrorToast(res.error || "Invalid email or password");
        return;
      }

      setSelectedChat(null);

      showSuccessToast("Logged in successfully! 🎉");
      setTimeout(() => {
  chatStore.initSocket();
}, 500);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({
          firstname: res.user?.firstname,
          lastname: res.user?.lastname,
          email: payload.email,
        })
      );

      await new Promise((r) => setTimeout(r, 100));

      await fetchChats();
      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      const status = error.response?.status;

      if (status === 401) {
        showErrorToast("Invalid email or password");
      } else if (status === 429) {
        showErrorToast("Too many login attempts. Try again later.");
      } else if (Array.isArray(res?.details)) {
        showErrorToast("Validation failed", res.details);
      } else if (res?.error) {
        showErrorToast(res.error);
      } else {
        showErrorToast("Failed to log in. Please try again later.");
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
          id="login-email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
          autoFocus
        />
      </div>

      <div className="input-container">
        <label>Password:</label>
        <Input
          type="password"
          name="password"
          id="login-password"
          autoComplete="current-password"
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
          name={loading ? "Logging In..." : "Log In"}
          disabled={loading}
        />
        <Button
          type="button"
          name="Sign Up"
          onClick={switchToSignup}
          disabled={loading}
          className="secondary-button"
        />
      </div>
    </form>
  );
};

export default LogIn;
