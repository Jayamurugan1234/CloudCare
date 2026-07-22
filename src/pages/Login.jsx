import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Login.css";

const ROLES = [
  {
    value: "doctor",
    label: "Doctor",
    idLabel: "Doctor ID",
    idPlaceholder: "DOC123456",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M6 3v6a4 4 0 0 0 8 0V3" strokeLinecap="round" />
        <path d="M10 9v3a5 5 0 0 0 10 0v-2" strokeLinecap="round" />
        <circle cx="20" cy="8" r="2" />
      </svg>
    ),
  },
  {
    value: "staff",
    label: "Staff",
    idLabel: "Staff ID",
    idPlaceholder: "STF123456",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="5" y="4" width="14" height="17" rx="2" />
        <path d="M9 3h6v3H9z" />
        <path d="M8.5 12h7M8.5 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    value: "pharmacy",
    label: "Pharmacy",
    idLabel: "Pharmacy ID",
    idPlaceholder: "PHM123456",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
        <rect x="3.5" y="9.5" width="17" height="8" rx="4" transform="rotate(-40 12 13)" />
        <path d="M9.2 15.8 14.8 10.2" strokeLinecap="round" />
      </svg>
    ),
  },
];

function Login() {
  const [role, setRole] = useState("doctor");
  const [loginId, setLoginId] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const activeRole = ROLES.find((r) => r.value === role);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await api.post("/auth/login/", { role, login_id: loginId, email, password });
      localStorage.setItem("access", res.data.access);
      localStorage.setItem("refresh", res.data.refresh);
      localStorage.setItem("role", res.data.role);
      localStorage.setItem("name", res.data.name);
      if (res.data.doctor_id) localStorage.setItem("doctorId", res.data.doctor_id);
      if (res.data.staff_id) localStorage.setItem("staffId", res.data.staff_id);
      if (res.data.pharmacy_id) localStorage.setItem("pharmacyId", res.data.pharmacy_id);
      navigate(`/${res.data.role}/dashboard`);
    } catch (err) {
      setError(err.response?.data?.detail || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-shell">
        <div className="login-brand">
          <div className="login-brand-glow" />
          <div className="login-brand-top">
            <div className="login-logo">
              <span className="login-logo-dot" />
              CareCloud
            </div>
            <p className="login-tagline">
              Coordinated care, one calm dashboard for every role in the hospital.
            </p>
          </div>

          <svg className="login-ecg" viewBox="0 0 400 100" preserveAspectRatio="none">
            <path
              id="ecg-path"
              d="M0,55 L60,55 L80,55 L95,20 L112,90 L128,10 L145,55 L165,55 L400,55"
              fill="none"
            />
            <circle r="4" className="login-ecg-dot">
              <animateMotion dur="3.2s" repeatCount="indefinite" rotate="auto">
                <mpath href="#ecg-path" />
              </animateMotion>
            </circle>
          </svg>

          <p className="login-brand-foot">Trusted by care teams to keep every shift in sync.</p>
        </div>

        <form className="login-card" onSubmit={handleLogin}>
          <h1>Sign in</h1>
          <p className="login-sub">Select your role to continue</p>

          <div className="login-role-tabs" role="tablist">
            {ROLES.map((r) => (
              <button
                type="button"
                key={r.value}
                role="tab"
                aria-selected={role === r.value}
                className={`login-role-tab ${role === r.value ? "is-active" : ""}`}
                onClick={() => setRole(r.value)}
              >
                <span className="login-role-icon">{r.icon}</span>
                {r.label}
              </button>
            ))}
          </div>

          <label>{activeRole.idLabel}</label>
          <input
            type="text"
            value={loginId}
            onChange={(e) => setLoginId(e.target.value)}
            placeholder={activeRole.idPlaceholder}
            required
          />

          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />

          <label>Password</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />

          {error && <p className="login-error">{error}</p>}

          <button type="submit" className="login-submit" disabled={loading}>
            {loading ? <span className="login-spinner" /> : "Login"}
          </button>

          <p className="login-footer">
            New here? <Link to={`/register/${role}`}>Create an account</Link>
          </p>
          <p className="login-footer">
            Patient? <Link to="/patient-form">Book an appointment</Link>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;