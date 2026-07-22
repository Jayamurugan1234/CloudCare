import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import "./DoctorAvailability.css";

function DoctorAvailability() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.get("/doctors/availability/")
      .then((res) => setRows(res.data))
      .catch((err) => console.error("Failed to load availability", err))
      .finally(() => setLoading(false));
  }, []);

  const updateRow = (weekday, field, value) => {
    setRows((prev) =>
      prev.map((r) => (r.weekday === weekday ? { ...r, [field]: value } : r))
    );
    setSaved(false);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await api.put("/doctors/availability/", rows);
      setRows(res.data);
      setSaved(true);
    } catch (err) {
      alert("Could not save availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="availability-page">
      <div className="availability-header">
        <Link to="/doctor/dashboard" className="stat-detail-back">← Back to dashboard</Link>
        <h1>Weekly Availability</h1>
        <p>Staff use this to know when you're seeing patients.</p>
      </div>

      <div className="availability-body">
        {loading && <p className="stat-detail-note">Loading…</p>}

        {!loading && (
          <>
            <div className="availability-grid">
              {rows.map((r) => (
                <div className={`availability-row ${r.is_off ? "is-off" : ""}`} key={r.weekday}>
                  <div className="availability-day">{r.weekday_label}</div>

                  <label className="availability-toggle">
                    <input
                      type="checkbox"
                      checked={!r.is_off}
                      onChange={(e) => updateRow(r.weekday, "is_off", !e.target.checked)}
                    />
                    Working
                  </label>

                  <input
                    type="time"
                    value={r.start_time || ""}
                    disabled={r.is_off}
                    onChange={(e) => updateRow(r.weekday, "start_time", e.target.value)}
                  />
                  <span className="availability-to">to</span>
                  <input
                    type="time"
                    value={r.end_time || ""}
                    disabled={r.is_off}
                    onChange={(e) => updateRow(r.weekday, "end_time", e.target.value)}
                  />
                </div>
              ))}
            </div>

            <button className="availability-save" onClick={handleSave} disabled={saving}>
              {saving ? "Saving…" : "Save Availability"}
            </button>
            {saved && <p className="availability-saved-note">Saved.</p>}
          </>
        )}
      </div>
    </div>
  );
}

export default DoctorAvailability;