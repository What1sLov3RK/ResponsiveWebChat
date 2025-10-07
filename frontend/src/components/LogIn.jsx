import React, { useState } from "react";
import Modal from "./Modal";
import "../css/modal.css"; // keep modal layout only
import Input from "./Input";
import Button from "./Button";
import api from "../api";
import { toast } from "react-toastify";
import chatStore from "../chatStore";

const LogIn = ({ onClose, switchToSignup }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { setChats, setSelectedChat, fetchChats } = chatStore;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const payload = { email, password };
      const response = await api.post("/users/login", payload);

      if (!response.ok) {
        toast.error(response.error || "Invalid credentials");
        return;
      }

      localStorage.setItem("access-token", response.access_token);
      localStorage.setItem("refresh-token", response.refresh_token);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({
          firstname: response.firstname,
          lastname: response.lastname,
          email: payload.email,
        })
      );

      toast.success("Logged in successfully!");
      setSelectedChat(null);
      setChats([]);
      await fetchChats();
      onClose();
    } catch (error) {
      console.error("Login error:", error);
      const res = error.response?.data;
      if (Array.isArray(res?.errors)) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.error(error.message || "Failed to log in. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} name="Log In">
      <form onSubmit={handleSubmit}>
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
            name="Sign Up"
            onClick={switchToSignup}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default LogIn;
