import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/axios";
import "./PharmacyDashboard.css";

function PharmacyDashboard() {
  const [orders, setOrders] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await api.get("/patients/pharmacy/orders/");
      setOrders(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const pending = orders.filter((o) => !o.is_bought);
  const dispensed = orders.filter((o) => o.is_bought);

  const handleView = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const handleComplete = async (id) => {
    try {
      await api.patch(`/patients/pharmacy/orders/${id}/`, {
        payment_method: paymentMethod,
        is_bought: true,
      });
      setExpandedId(null);
      fetchOrders();
    } catch (err) {
      console.log(err);
      alert("Failed to complete order");
    }
  };

  return (
    <div className="pharmacy-dashboard">
      <div className="pharmacy-header">
        <div>
          <p className="pharmacy-label">PHARMACY PORTAL</p>
          <h1>Good morning, {localStorage.getItem("name")}</h1>
        </div>
        <button className="logout-btn" onClick={() => { localStorage.clear(); navigate("/"); }}>
          Logout
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-number">{orders.length}</div>
          <div className="stat-label">Total Prescriptions</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{pending.length}</div>
          <div className="stat-label">Pending Orders</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">{dispensed.length}</div>
          <div className="stat-label">Dispensed</div>
        </div>
      </div>

      <section className="orders-section">
        <h2>Pending Orders</h2>
        {pending.length === 0 ? (
          <p className="empty-text">No pending orders</p>
        ) : (
          pending.map((order) => (
            <div key={order.id} className="order-card pending">
              <div className="order-row">
                <div className="order-info">
                  <p className="order-patient">
                    {order.patient_name} <span className="order-id">({order.patient_id})</span>
                  </p>
                  <p className="order-doctor">Dr. {order.doctor_name} — {order.specialist}</p>
                </div>
                <button className="view-btn" onClick={() => handleView(order.id)}>
                  {expandedId === order.id ? "Close" : "View"}
                </button>
              </div>

              {expandedId === order.id && (
                <div className="order-details">
                  <p className="prescription-label">Prescription:</p>
                  <p className="prescription-text">{order.prescription_notes || "No notes provided"}</p>

                  <label>Payment Method</label>
                  <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="insurance">Insurance</option>
                  </select>

                  <button className="complete-btn" onClick={() => handleComplete(order.id)}>
                    Complete
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </section>

      <section className="orders-section">
        <h2>Dispensed</h2>
        {dispensed.length === 0 ? (
          <p className="empty-text">Nothing dispensed yet</p>
        ) : (
          dispensed.map((order) => (
            <div key={order.id} className="order-card dispensed">
              <div className="order-row">
                <div className="order-info">
                  <p className="order-patient">
                    {order.patient_name} <span className="order-id">({order.patient_id})</span>
                  </p>
                  <p className="order-doctor">Dr. {order.doctor_name} — {order.specialist}</p>
                  <p className="prescription-text">{order.prescription_notes}</p>
                </div>
                <span className="payment-badge">{order.payment_method}</span>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default PharmacyDashboard;