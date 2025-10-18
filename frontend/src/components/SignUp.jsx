import React, { useState } from "react";
import "../css/modal.css";
import Input from "./Input";
import Button from "./Button";
import { toast } from "react-toastify";
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
        toast.error(res.error);
        return;
      }

      toast.success("Account created successfully! 🎉");

      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({ firstname, lastname, email })
      );

      setSelectedChat(null);
      setTimeout(() => {
  chatStore.initSocket();
}, 500);

      await new Promise((r) => setTimeout(r, 100));

      await fetchChats();
      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      const status = error.response?.status;

      if (status === 409) {
        toast.error("User with this email already exists");
      } else if (Array.isArray(res?.details)) {
        res.details.forEach((msg) => toast.error(msg));
      } else {
        toast.error(res?.error || "Registration failed");
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
        <label>First name:</label>
        <Input
          type="text"
          value={firstname}
          onChange={(e) => setFirstname(e.target.value)}
          placeholder="Enter your first name"
          required
        />
      </div>

      <div className="modal-input-container">
        <label>Last name:</label>
        <Input
          type="text"
          value={lastname}
          onChange={(e) => setLastname(e.target.value)}
          placeholder="Enter your last name"
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
          name={loading ? "Signing Up..." : "Sign Up"}
          disabled={loading}
        />
        <Button
          type="button"
          name="Log In"
          onClick={switchToLogin}
          disabled={loading}
        />
      </div>
    </form>
  );
};

export default SignUp;
