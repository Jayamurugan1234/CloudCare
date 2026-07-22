import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

function RegisterPharmacy() {
  const [form, setForm] = useState({ name: "", email: "", password: "", phone: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      await api.post("/auth/register/", { role: "pharmacy", ...form });
      alert("Pharmacy account created. Please log in.");
      navigate("/");
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Registration failed");
    }
  };

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Pharmacy Registration</h1>

        <label>Pharmacy / Staff Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        {error && <p className="register-error">{error}</p>}

        <button type="submit">Create Account</button>

        <p className="register-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterPharmacy;