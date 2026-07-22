import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api/axios";
import "./StatDetail.css";

const DOCTOR_ENDPOINTS = {
  appointments: { url: "/patients/doctor/appointments-today/", type: "patients" },
  "patients-waiting": { url: "/patients/doctor/waiting/", type: "patients-waiting" },
  completed: { url: "/patients/doctor/completed-today/", type: "completed" },
  "consult-time": { url: "/patients/doctor/avg-consult-time/", type: "metric" },
};

const STAFF_ENDPOINTS = {
  "check-ins": { url: "/staff/check-ins-today/", type: "patients" },
  calls: { url: "/staff/calls/", type: "calls" },
  beds: { url: "/staff/rooms/", type: "rooms" },
};

const ENDPOINTS_BY_ROLE = { doctor: DOCTOR_ENDPOINTS, staff: STAFF_ENDPOINTS };

const TITLES = {
  appointments: { title: "Today's Appointments", description: "Everyone booked with you today." },
  "patients-waiting": { title: "Patients Waiting", description: "Checked in, not yet seen." },
  completed: { title: "Completed Today", description: "Consultations you've finished today." },
  "consult-time": { title: "Average Consult Time", description: "Based on today's completed consultations." },
  "check-ins": { title: "Check-ins Today", description: "Everyone with an appointment today, across all doctors." },
  calls: { title: "Calls Handled", description: "Logged calls." },
  beds: { title: "Beds Available", description: "Tap a room to toggle occupied / available." },
};

const EMPTY_VITALS = {
  height_cm: "", weight_kg: "", blood_pressure: "", pulse_bpm: "",
  diagnosis: "", prescription_notes: "", lab_test: "",
};

function ConsultationModal({ patient, existing, onClose, onSaved }) {
  const isEditing = !!existing?.exists;

  const [vitals, setVitals] = useState(
    isEditing
      ? {
          height_cm: existing.height_cm ?? "",
          weight_kg: existing.weight_kg ?? "",
          blood_pressure: existing.blood_pressure ?? "",
          pulse_bpm: existing.pulse_bpm ?? "",
          diagnosis: existing.diagnosis ?? "",
          prescription_notes: existing.prescription_notes ?? "",
          lab_test: existing.lab_test ?? "",
        }
      : EMPTY_VITALS
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => setVitals({ ...vitals, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await api.post(`/patients/doctor/consult/${patient.patient_id}/`, vitals);
      onSaved();
    } catch (err) {
      setError("Could not save consultation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="consult-modal-backdrop" onClick={onClose}>
      <div className="consult-modal" onClick={(e) => e.stopPropagation()}>
        <div className="consult-modal-header">
          <h2>{isEditing ? "Edit Consultation" : "Consultation"} — {patient.name}</h2>
          <button className="consult-modal-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="consult-modal-readonly">
          <div><span>Name</span><strong>{patient.name}</strong></div>
          <div><span>Age</span><strong>{patient.age}</strong></div>
          <div><span>Place</span><strong>{patient.place}</strong></div>
          <div className="consult-modal-issue"><span>Issue</span><strong>{patient.issue}</strong></div>
        </div>

        <form onSubmit={handleSave} className="consult-modal-form">
          <div className="consult-modal-row">
            <div>
              <label>Height (cm)</label>
              <input type="number" name="height_cm" value={vitals.height_cm} onChange={handleChange} />
            </div>
            <div>
              <label>Weight (kg)</label>
              <input type="number" name="weight_kg" value={vitals.weight_kg} onChange={handleChange} />
            </div>
          </div>

          <div className="consult-modal-row">
            <div>
              <label>Blood Pressure</label>
              <input name="blood_pressure" placeholder="120/80" value={vitals.blood_pressure} onChange={handleChange} />
            </div>
            <div>
              <label>Pulse (bpm)</label>
              <input type="number" name="pulse_bpm" value={vitals.pulse_bpm} onChange={handleChange} />
            </div>
          </div>

          <label>Description</label>
          <textarea name="diagnosis" rows="3" value={vitals.diagnosis} onChange={handleChange} />

          <label>Medicine</label>
          <textarea name="prescription_notes" rows="2" value={vitals.prescription_notes} onChange={handleChange} />

          <label>Lab Test</label>
          <textarea name="lab_test" rows="2" value={vitals.lab_test} onChange={handleChange} />

          {error && <p className="patient-error">{error}</p>}

          <div className="consult-modal-actions">
            <button type="button" className="consult-modal-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="consult-modal-save" disabled={saving}>
              {saving ? "Saving…" : isEditing ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function StatDetail() {
  const { role, statId } = useParams();
  const config = TITLES[statId] || { title: "Details", description: "" };
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);
  const [startingId, setStartingId] = useState(null);
  const [openingId, setOpeningId] = useState(null);
  const [activePatient, setActivePatient] = useState(null);
  const [activeExisting, setActiveExisting] = useState(null);
  const [togglingRoomId, setTogglingRoomId] = useState(null);

  const endpoint = ENDPOINTS_BY_ROLE[role]?.[statId] || null;

  const load = async () => {
    if (!endpoint) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await api.get(endpoint.url);
      setData(res.data);
    } catch (err) {
      console.error("Failed to load stat detail", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [statId, role]);

  const handleStart = async (patient) => {
    setStartingId(patient.patient_id);
    try {
      await api.post(`/patients/doctor/consult/start/${patient.patient_id}/`);
      setActiveExisting({ exists: false });
      setActivePatient(patient);
    } catch (err) {
      alert("Could not start consultation.");
    } finally {
      setStartingId(null);
    }
  };

  // Used for "Today's Appointments" — view/edit whatever consultation exists (or doesn't yet)
  const handleOpenAppointment = async (patient) => {
    setOpeningId(patient.patient_id);
    try {
      const res = await api.get(`/patients/doctor/consult/${patient.patient_id}/`);
      setActiveExisting(res.data);
      setActivePatient(patient);
    } catch (err) {
      alert("Could not load consultation details.");
    } finally {
      setOpeningId(null);
    }
  };

  const handleSaved = () => {
    setActivePatient(null);
    setActiveExisting(null);
    load();
  };

  const handleToggleRoom = async (roomId) => {
    setTogglingRoomId(roomId);
    try {
      const res = await api.patch(`/staff/rooms/${roomId}/toggle/`);
      setData((prev) => prev.map((r) => (r.id === roomId ? res.data : r)));
    } catch (err) {
      alert("Could not update room status.");
    } finally {
      setTogglingRoomId(null);
    }
  };

  return (
    <div className="stat-detail-page">
      <div className="stat-detail-header">
        <Link to={`/${role}/dashboard`} className="stat-detail-back">← Back to dashboard</Link>
        <h1>{config.title}</h1>
        <p>{config.description}</p>
      </div>

      <div className="stat-detail-body">
        {loading && (
          <div className="stat-skeleton-list">
            {[1, 2, 3].map((i) => (
              <div className="stat-skeleton-row" key={i}>
                <div className="stat-skeleton-avatar" />
                <div className="stat-skeleton-lines">
                  <div className="stat-skeleton-line stat-skeleton-line--wide" />
                  <div className="stat-skeleton-line stat-skeleton-line--narrow" />
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && !endpoint && (
          <p className="stat-detail-note">This page isn't connected to data yet for this role/stat.</p>
        )}

        {!loading && endpoint?.type === "metric" && data && (
          <div className="stat-metric-card">
            <div className="stat-metric-value">
              {data.avg_minutes ? `${data.avg_minutes} min` : "No data yet"}
            </div>
            <div className="stat-metric-caption">
              Based on {data.consultations_counted} consultation{data.consultations_counted === 1 ? "" : "s"} today
            </div>
          </div>
        )}

        {!loading && (endpoint?.type === "patients" || endpoint?.type === "patients-waiting") && (
          <div className="stat-list">
            {data && data.length === 0 && <p className="stat-detail-note">Nothing here right now.</p>}
            {data && data.map((p) => {
              const isAppointments = endpoint.type === "patients";
              return (
                <div
                  className={`stat-list-row ${isAppointments ? "stat-list-row--clickable" : ""}`}
                  key={p.patient_id}
                  onClick={isAppointments ? () => handleOpenAppointment(p) : undefined}
                >
                  <div className="stat-list-main">
                    <div className="stat-list-name">{p.name}</div>
                    <div className="stat-list-meta">
                      {p.preferred_time} · {p.phone} · {p.issue}
                    </div>
                  </div>
                  {isAppointments && (
                    <span className="stat-list-action stat-list-action--ghost">
                      {openingId === p.patient_id ? "Loading…" : "View / Edit"}
                    </span>
                  )}
                  {endpoint.type === "patients-waiting" && (
                    <button
                      className="stat-list-action"
                      disabled={startingId === p.patient_id}
                      onClick={(e) => { e.stopPropagation(); handleStart(p); }}
                    >
                      {startingId === p.patient_id ? "Starting…" : "Start Consultation"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {!loading && endpoint?.type === "completed" && (
          <div className="stat-list">
            {data && data.length === 0 && <p className="stat-detail-note">No consultations completed yet today.</p>}
            {data && data.map((c) => (
              <div className="stat-list-row" key={c.id}>
                <div className="stat-list-main">
                  <div className="stat-list-name">{c.patient_name}</div>
                  <div className="stat-list-meta">
                    {c.diagnosis || "No diagnosis noted"} · {c.duration_minutes ? `${c.duration_minutes}m` : "—"}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && endpoint?.type === "calls" && (
          <div className="stat-list">
            {data && data.length === 0 && <p className="stat-detail-note">No calls logged yet.</p>}
            {data && data.map((c) => (
              <div className="stat-list-row" key={c.id}>
                <div className="stat-list-main">
                  <div className="stat-list-name">{c.caller_name}</div>
                  <div className="stat-list-meta">
                    {c.phone}{c.note ? ` · ${c.note}` : ""} · {new Date(c.created_at).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && endpoint?.type === "rooms" && (
          <div className="stat-list">
            {data && data.length === 0 && (
              <p className="stat-detail-note">No rooms added yet — add some in Django admin.</p>
            )}
            {data && data.map((r) => (
              <div className="stat-list-row" key={r.id}>
                <div className="stat-list-main">
                  <div className="stat-list-name">
                    Room {r.room_number}
                    <span className={`room-badge ${r.is_occupied ? "is-occupied" : "is-available"}`}>
                      {r.is_occupied ? "Occupied" : "Available"}
                    </span>
                  </div>
                  <div className="stat-list-meta">{r.ward || "No ward set"}</div>
                </div>
                <button
                  className="stat-list-action"
                  disabled={togglingRoomId === r.id}
                  onClick={() => handleToggleRoom(r.id)}
                >
                  {togglingRoomId === r.id ? "Updating…" : r.is_occupied ? "Mark Available" : "Mark Occupied"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {activePatient && (
        <ConsultationModal
          patient={activePatient}
          existing={activeExisting}
          onClose={() => { setActivePatient(null); setActiveExisting(null); }}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}

export default StatDetail;