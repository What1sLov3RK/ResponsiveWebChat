import React, { useState } from "react";
import "../css/modal.css";
import Input from "./Input";
import Button from "./Button";
import api from "../api";
import { toast } from "react-toastify";
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
        toast.error(res.error || "Invalid email or password");
        return;
      }

      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({
          firstname: res.user?.firstname,
          lastname: res.user?.lastname,
          email: payload.email,
        })
      );

      toast.success("Logged in successfully! 🎉");
      setTimeout(() => {
  chatStore.initSocket();
}, 500);
      setSelectedChat(null);

      await new Promise((r) => setTimeout(r, 100));

      await fetchChats();
      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      const status = error.response?.status;

      if (status === 401) {
        toast.error("Invalid email or password");
      } else if (status === 429) {
        toast.error("Too many login attempts. Try again later.");
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.error("Failed to log in. Please try again later.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} noValidate autoComplete="off">
      <div className="modal-input-container">
        <label>Email:</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter your email"
          required
        />
      </div>

      <div className="modal-input-container">
        <label>Password:</label>
        <Input
          type="password"
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
        />
      </div>
    </form>
  );
};

export default LogIn;
