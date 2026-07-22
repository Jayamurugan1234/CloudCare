import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./PatientForm.css";

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

function PatientForm() {
  const [form, setForm] = useState({
    name: "",
    age: "",
    issue: "",
    specialist_wanted: "",
    preferred_date: "",
    preferred_time: "",
    place: "",
    phone: "",
    email: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientId, setPatientId] = useState(null);
  const [showOtherSpecialist, setShowOtherSpecialist] = useState(false);

  // Doctor lookup state
  const [doctorInfo, setDoctorInfo] = useState(null);
  const [checkingDoctor, setCheckingDoctor] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSpecialistSelect = (e) => {
    const value = e.target.value;
    if (value === "Others") {
      setShowOtherSpecialist(true);
      setForm({ ...form, specialist_wanted: "" });
      setDoctorInfo(null);
    } else {
      setShowOtherSpecialist(false);
      setForm({ ...form, specialist_wanted: value });
    }
  };

  // Look up doctor whenever a real (non-"Others") specialist is chosen
  useEffect(() => {
    if (showOtherSpecialist || !form.specialist_wanted) {
      setDoctorInfo(null);
      return;
    }

    let cancelled = false;
    setCheckingDoctor(true);
    setDoctorInfo(null);

    api
      .get("/doctors/available/", { params: { specialist: form.specialist_wanted } })
      .then((res) => {
        if (!cancelled) setDoctorInfo(res.data);
      })
      .catch(() => {
        if (!cancelled) setDoctorInfo({ found: false, message: "Could not check doctor availability." });
      })
      .finally(() => {
        if (!cancelled) setCheckingDoctor(false);
      });

    return () => {
      cancelled = true;
    };
  }, [form.specialist_wanted, showOtherSpecialist]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/patients/register/", form);
      setPatientId(res.data.patient_id);
    } catch (err) {
      setError(JSON.stringify(err.response?.data) || "Could not submit appointment");
    } finally {
      setLoading(false);
    }
  };

  if (patientId) {
    return (
      <div className="patient-page">
        <div className="patient-card patient-success">
          <div className="patient-success-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h1>Appointment requested</h1>
          <p>We've received your details and sent a confirmation to your email.</p>
          <p className="patient-id-tag">Your patient ID: <strong>{patientId}</strong></p>
          <Link to="/" className="patient-back-link">Back to login</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-page">
      <form className="patient-card" onSubmit={handleSubmit}>
        <h1>Book an Appointment</h1>
        <p className="patient-sub">Tell us a bit about you and we'll confirm by email.</p>

        <label>Full Name</label>
        <input name="name" value={form.name} onChange={handleChange} required />

        <div className="patient-row">
          <div>
            <label>Age</label>
            <input type="number" name="age" value={form.age} onChange={handleChange} required />
          </div>
          <div>
            <label>Specialist Wanted</label>
            <select
              value={showOtherSpecialist ? "Others" : form.specialist_wanted}
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
                name="specialist_wanted"
                placeholder="Please specify"
                value={form.specialist_wanted}
                onChange={handleChange}
                required
                className="patient-other-specialist"
              />
            )}
          </div>
        </div>

        {/* Doctor lookup result */}
        {!showOtherSpecialist && form.specialist_wanted && (
          <div className="patient-doctor-box">
            {checkingDoctor && <p className="patient-doctor-checking">Checking doctor availability…</p>}

            {!checkingDoctor && doctorInfo?.found && (
              <div className="patient-doctor-found">
                <p>
                  <strong>{doctorInfo.name}</strong>{" "}
                  <span className="patient-doctor-id">({doctorInfo.doctor_id})</span>
                </p>
                <span
                  className={`patient-availability-badge ${
                    doctorInfo.is_available_now ? "is-available" : "is-unavailable"
                  }`}
                >
                  {doctorInfo.status_message}
                </span>
              </div>
            )}

            {!checkingDoctor && doctorInfo && !doctorInfo.found && (
              <p className="patient-doctor-none">
                {doctorInfo.message || "No approved doctor for this specialist yet."}
              </p>
            )}
          </div>
        )}

        <label>Phone</label>
        <input name="phone" value={form.phone} onChange={handleChange} required />

        <label>Email</label>
        <input type="email" name="email" value={form.email} onChange={handleChange} required />
        <p className="patient-hint">Confirmation will be sent to this email.</p>

        <div className="patient-row">
          <div>
            <label>Preferred Date</label>
            <input type="date" name="preferred_date" value={form.preferred_date} onChange={handleChange} required />
          </div>
          <div>
            <label>Preferred Time</label>
            <input type="time" name="preferred_time" value={form.preferred_time} onChange={handleChange} required />
          </div>
        </div>

        <label>Place</label>
        <input name="place" value={form.place} onChange={handleChange} required />

        <label>Issue / Reason for visit</label>
        <textarea name="issue" rows="3" value={form.issue} onChange={handleChange} required />

        {error && <p className="patient-error">{error}</p>}

        {!showOtherSpecialist && doctorInfo && !doctorInfo.is_available_now && (
          <p className="patient-warning">
            This doctor isn't currently available. You can still request this slot — the clinic will confirm by email.
          </p>
        )}

        <button type="submit" className="patient-submit" disabled={loading}>
          {loading ? <span className="patient-spinner" /> : "Request Appointment"}
        </button>

        <p className="patient-footer">
          Are you staff/doctor? <Link to="/">Login here</Link>
        </p>
      </form>
    </div>
  );
}

export default PatientForm;