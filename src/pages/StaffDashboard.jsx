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
  "check-ins": <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />,
  doctors: <><rect x="4" y="4" width="16" height="17" rx="2" /><path d="M8 3v3M16 3v3" strokeLinecap="round" /></>,
  calls: <path d="M4 6c0 8 6 14 14 14l2-4-5-2-2 2c-3-1.5-5-3.5-6.5-6.5l2-2-2-5-4 2" strokeLinejoin="round" />,
  beds: <><rect x="3" y="10" width="18" height="8" rx="1.5" /><path d="M3 14h18M6 10V7h6v3" strokeLinecap="round" /></>,
};

function StaffDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem("name");
  const staffId = localStorage.getItem("staffId");
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState([
    { id: "check-ins", label: "Check-ins Today", value: "—", to: "/staff/stat/check-ins" },
    { id: "doctors", label: "Doctors on Staff", value: "—", to: "/staff/doctors" },
    { id: "calls", label: "Calls Handled", value: "—", to: "/staff/stat/calls" },
    { id: "beds", label: "Beds Available", value: "—", to: "/staff/stat/beds" },
  ]);

  useEffect(() => {
    const load = async () => {
      try {
        const [checkIns, doctors, calls, rooms] = await Promise.all([
          api.get("/staff/check-ins-today/"),
          api.get("/doctors/list/"),
          api.get("/staff/calls/"),
          api.get("/staff/rooms/"),
        ]);
        const availableBeds = rooms.data.filter((r) => !r.is_occupied).length;

        setStats([
          { id: "check-ins", label: "Check-ins Today", value: String(checkIns.data.length), to: "/staff/stat/check-ins" },
          { id: "doctors", label: "Doctors on Staff", value: String(doctors.data.length), to: "/staff/doctors" },
          { id: "calls", label: "Calls Handled", value: String(calls.data.length), to: "/staff/stat/calls" },
          { id: "beds", label: "Beds Available", value: String(availableBeds), to: "/staff/stat/beds" },
        ]);
      } catch (err) {
        console.error("Failed to load staff dashboard stats", err);
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
          <p className="dashboard-eyebrow">Staff Portal</p>
          <h1>{greeting()}, {name || "—"}</h1>
          <p>ID: {staffId || "—"} · Front desk overview for today.</p>
        </div>
        <div className="dashboard-header-actions">
          <button className="dashboard-logout" onClick={handleLogout}>Logout</button>
        </div>
      </div>
      <div className="dashboard-content">
        {stats.map((s) => (
          <Link className="dashboard-card" to={s.to} key={s.id}>
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

export default StaffDashboard;