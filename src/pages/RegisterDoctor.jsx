import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./Register.css";

const SPECIALISTS = [
  "General Physician",
  "Cardiologist",
  "Neurologist",
  "Orthopedic Surgeon",
  "Pediatrician",
  "Gynecologist",
  "Dermatologist",
  "Ophthalmologist",
  "ENT Specialist",
  "Psychiatrist",
  "Pulmonologist",
  "Gastroenterologist",
  "Nephrologist",
  "Urologist",
  "Endocrinologist",
  "Oncologist",
  "Hematologist",
  "Dentist",
  "Radiologist",
  "Pathologist",
  "General Surgeon",
  "Emergency Medicine Specialist",
  "Anesthesiologist",
  "Plastic Surgeon",
  "Sports Medicine Specialist",
  "Geriatrician",
];

function RegisterDoctor() {
  const [form, setForm] = useState({
    name: "", email: "", password: "", phone: "", specialist: "",
  });
  const [certificate, setCertificate] = useState(null);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showOtherSpecialist, setShowOtherSpecialist] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSpecialistSelect = (e) => {
    const value = e.target.value;
    if (value === "Others") {
      setShowOtherSpecialist(true);
      setForm({ ...form, specialist: "" });
    } else {
      setShowOtherSpecialist(false);
      setForm({ ...form, specialist: value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!certificate) {
      setError("Please upload your degree certificate.");
      return;
    }

    const data = new FormData();
    data.append("role", "doctor");
    data.append("name", form.name);
    data.append("email", form.email);
    data.append("password", form.password);
    data.append("phone", form.phone);
    data.append("specialist", form.specialist);
    data.append("degree_certificate", certificate);

    try {
      await api.post("/auth/register/", data, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSubmitted(true);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Registration failed");
    }
  };

  if (submitted) {
    return (
      <div className="register-page">
        <div className="register-card">
          <h1>Registration Submitted</h1>
          <p>
            Your doctor account is pending admin approval. You'll receive your
            Doctor ID by email once approved.
          </p>
          <Link to="/" className="register-footer">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="register-page">
      <form className="register-card" onSubmit={handleSubmit}>
        <h1>Doctor Registration</h1>

        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <label>Specialist</label>
        <select
          value={showOtherSpecialist ? "Others" : form.specialist}
          onChange={handleSpecialistSelect}
          required
        >
          <option value="" disabled>Select a specialist</option>
          {SPECIALISTS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
          <option value="Others">Others</option>
        </select>
        {showOtherSpecialist && (
          <input
            type="text"
            name="specialist"
            placeholder="Please specify"
            value={form.specialist}
            onChange={handleChange}
            required
            className="patient-other-specialist"
          />
        )}

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />

        <label>Password</label>
        <input type="password" name="password" value={form.password} onChange={handleChange} required />

        <label>Degree Certificate (PDF/Image)</label>
        <input
          type="file"
          accept=".pdf,.jpg,.jpeg,.png"
          onChange={(e) => setCertificate(e.target.files[0])}
          required
        />

        {error && <p className="register-error">{error}</p>}

        <button type="submit">Submit for Approval</button>

        <p className="register-footer">
          Already have an account? <Link to="/">Login</Link>
        </p>
      </form>
    </div>
  );
}

export default RegisterDoctor;