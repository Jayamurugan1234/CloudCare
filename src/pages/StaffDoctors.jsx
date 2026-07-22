import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./StaffDoctors.css";

const WEEKDAY_ORDER = [0, 1, 2, 3, 4, 5, 6];

function StaffDoctors() {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState(null);
  const [scheduleCache, setScheduleCache] = useState({});
  const [scheduleLoading, setScheduleLoading] = useState(false);

  useEffect(() => {
    api.get("/doctors/list/")
      .then((res) => setDoctors(res.data))
      .catch((err) => console.error("Failed to load doctors", err))
      .finally(() => setLoading(false));
  }, []);

  const handleExpand = async (doctorId) => {
    if (expandedId === doctorId) {
      setExpandedId(null);
      return;
    }
    setExpandedId(doctorId);
    if (scheduleCache[doctorId]) return;

    setScheduleLoading(true);
    try {
      const res = await api.get(`/doctors/availability/${doctorId}/`);
      setScheduleCache((prev) => ({ ...prev, [doctorId]: res.data }));
    } catch (err) {
      console.error("Failed to load availability", err);
    } finally {
      setScheduleLoading(false);
    }
  };

  return (
    <div className="staff-doctors-page">
      <div className="stat-detail-header">
        <Link to="/staff/dashboard" className="stat-detail-back">← Back to dashboard</Link>
        <h1>Doctors on Staff</h1>
        <p>Tap a doctor to see their weekly availability.</p>
      </div>

      <div className="staff-doctors-body">
        {loading && <p className="stat-detail-note">Loading…</p>}
        {!loading && doctors.length === 0 && <p className="stat-detail-note">No doctors registered yet.</p>}

        {!loading && doctors.map((d) => {
          const isExpanded = expandedId === d.id;
          const schedule = scheduleCache[d.id];

          return (
            <div className={`staff-doctor-card ${isExpanded ? "is-expanded" : ""}`} key={d.id}>
              <button className="staff-doctor-summary" onClick={() => handleExpand(d.id)}>
                <div>
                  <div className="staff-doctor-name">{d.name}</div>
                  <div className="staff-doctor-meta">{d.specialist} · {d.phone}</div>
                </div>
                <span className={`room-badge ${d.is_available ? "is-available" : "is-occupied"}`}>
                  {d.is_available ? "Available" : "Unavailable"}
                </span>
              </button>

              {isExpanded && (
                <div className="staff-doctor-schedule">
                  {scheduleLoading && !schedule && <p className="stat-detail-note">Loading schedule…</p>}
                  {schedule && (
                    <div className="staff-schedule-grid">
                      {schedule.availability
                        .slice()
                        .sort((a, b) => WEEKDAY_ORDER.indexOf(a.weekday) - WEEKDAY_ORDER.indexOf(b.weekday))
                        .map((row) => (
                          <div className={`staff-schedule-row ${row.is_off ? "is-off" : ""}`} key={row.weekday}>
                            <span className="staff-schedule-day">{row.weekday_label}</span>
                            <span className="staff-schedule-time">
                              {row.is_off
                                ? "Off"
                                : row.start_time && row.end_time
                                ? `${row.start_time} – ${row.end_time}`
                                : "Not set"}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default StaffDoctors;