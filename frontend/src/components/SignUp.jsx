import React, { useState } from "react";
import Modal from "./Modal";
import "../css/modal.css"; // ✅ use modal layout styles, not form.css
import Input from "./Input";
import Button from "./Button";
import { toast } from "react-toastify";
import chatStore from "../chatStore";
import api from "../api";

const SignUp = ({ onClose, switchToLogin }) => {
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const { setChats, setSelectedChat, fetchChats } = chatStore;

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (loading) return;
    setLoading(true);

    try {
      const payload = {
        email,
        firstname: firstName,
        lastname: lastName,
        password,
      };

      const response = await api.post("/users/registration", payload);

      if (!response.ok) {
        toast.error(response.error || "Failed to sign up");
        return;
      }

      localStorage.setItem("access-token", response.access_token);
      localStorage.setItem("refresh-token", response.refresh_token);
      localStorage.setItem("authorized", "true");
      localStorage.setItem(
        "user-info",
        JSON.stringify({
          firstname: firstName,
          lastname: lastName,
          email: payload.email,
        })
      );

      toast.success("Account created successfully!");
      setSelectedChat(null);
      setChats([]);
      await fetchChats();
      onClose();
    } catch (error) {
      console.error("Signup error:", error);
      const res = error.response?.data;

      if (Array.isArray(res?.errors)) {
        res.errors.forEach((err) => toast.error(err.msg));
      } else if (res?.error) {
        toast.error(res.error);
      } else {
        toast.error(error.message || "Failed to sign up. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal onClose={onClose} name="Sign Up">
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
          <label>First name:</label>
          <Input
            type="text"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            placeholder="Enter your first name"
            required
          />
        </div>

        <div className="modal-input-container">
          <label>Last name:</label>
          <Input
            type="text"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
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
            name="Log In"
            onClick={switchToLogin}
            disabled={loading}
          />
        </div>
      </form>
    </Modal>
  );
};

export default SignUp;
