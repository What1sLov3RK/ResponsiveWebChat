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
      const data = await api.post("/users/registration", payload);

      if (!data?.access_token || !data?.refresh_token) {
        toast.error(data?.error || "Failed to sign up");
        return;
      }

      localStorage.setItem("access-token", data.access_token);
      localStorage.setItem("refresh-token", data.refresh_token);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({ firstname, lastname, email })
      );

      toast.success("Account created successfully!");
      setSelectedChat(null);
      chatStore.initSocket();
      await fetchChats();

      onClose?.();
    } catch (error) {
      const res = error.response?.data;
      if (Array.isArray(res?.errors)) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else {
        toast.error(res?.error || error.details || "Failed to sign up");
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
        <Button type="button" name="Log In" onClick={switchToLogin} disabled={loading} />
      </div>
    </form>
  );
};

export default SignUp;
