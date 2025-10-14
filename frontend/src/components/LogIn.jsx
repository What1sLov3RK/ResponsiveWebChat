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
      const data = await api.post("/users/login", payload);

      if (!data?.access_token || !data?.refresh_token) {
        toast.error(data?.error || "Invalid email or password");
        return;
      }

      localStorage.setItem("access-token", data.access_token);
      localStorage.setItem("refresh-token", data.refresh_token);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({
          firstname: data.firstname,
          lastname: data.lastname,
          email: payload.email,
        })
      );
    chatStore.initSocket();
    toast.success("Logged in successfully!");
    setSelectedChat(null);
    await fetchChats();

      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      const message =
        res?.error ||
        res?.message ||
        (error.response?.status === 401
          ? "Invalid email or password"
          : "Failed to log in. Please try again.");
      toast.error(message);
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