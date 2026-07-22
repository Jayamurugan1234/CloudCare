import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import "./Dashboard.css";

const greeting = () => {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
};

const ICONS = {
  appointments: <path d="M4 6h16M4 12h16M4 18h10" strokeLinecap="round" />,
  "patients-waiting": <><circle cx="9" cy="8" r="3" /><path d="M4 20c0-3 2.5-5 5-5s5 2 5 5" strokeLinecap="round" /></>,
  completed: <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />,
  "consult-time": <><circle cx="12" cy="12" r="8" /><path d="M12 8v4l3 2" strokeLinecap="round" /></>,
};

function DoctorDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const doctorId = localStorage.getItem("doctorId");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { id: "appointments", label: "Today's Appointments", value: "—" },
    { id: "patients-waiting", label: "Patients Waiting", value: "—" },
    { id: "completed", label: "Completed Today", value: "—" },
    { id: "consult-time", label: "Avg. Consult Time", value: "—" },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [appointments, waiting, completed, avgTime] = await Promise.all([
          api.get("/patients/doctor/appointments-today/"),
          api.get("/patients/doctor/waiting/"),
          api.get("/patients/doctor/completed-today/"),
          api.get("/patients/doctor/avg-consult-time/"),
        ]);
        setStats([
          { id: "appointments", label: "Today's Appointments", value: String(appointments.data.length) },
          { id: "patients-waiting", label: "Patients Waiting", value: String(waiting.data.length) },
          { id: "completed", label: "Completed Today", value: String(completed.data.length) },
          {
            id: "consult-time",
            label: "Avg. Consult Time",
            value: avgTime.data.avg_minutes ? `${avgTime.data.avg_minutes}m` : "—",
          },
        ]);
      } catch (err) {
        console.error("Failed to load dashboard stats", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <p className="dashboard-eyebrow">Doctor Portal</p>
          <h1>{greeting()}, Dr. {name || "—"}</h1>
          <p>ID: {doctorId || "—"} · Here's how your day is shaping up.</p>
        </div>
        <div className="dashboard-header-actions">
          <Link to="/doctor/availability" className="dashboard-secondary-btn">
            Manage Availability
          </Link>
          <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {stats.map((s) => (
          <Link className="dashboard-card" to={`/doctor/stat/${s.id}`} key={s.id}>
            <div className="dashboard-card-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                {ICONS[s.id]}
              </svg>
            </div>
            <div className={`dashboard-card-value ${loading ? "is-loading" : ""}`}>{s.value}</div>
            <div className="dashboard-card-label">{s.label}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

export default DoctorDashboard;