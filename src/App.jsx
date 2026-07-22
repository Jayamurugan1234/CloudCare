import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./pages/Login.jsx";
import RegisterDoctor from "./pages/RegisterDoctor.jsx";
import RegisterStaff from "./pages/RegisterStaff.jsx";
import RegisterPharmacy from "./pages/RegisterPharmacy.jsx";
import PatientForm from "./pages/PatientForm.jsx";
import DoctorDashboard from "./pages/DoctorDashboard.jsx";
import StaffDashboard from "./pages/StaffDashboard.jsx";
import PharmacyDashboard from "./pages/PharmacyDashboard.jsx";
import StatDetail from "./pages/StatDetail.jsx";
import DoctorAvailability from "./pages/DoctorAvailability.jsx";
import StaffDoctors from "./pages/StaffDoctors.jsx";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/register/doctor" element={<RegisterDoctor />} />
        <Route path="/register/staff" element={<RegisterStaff />} />
        <Route path="/register/pharmacy" element={<RegisterPharmacy />} />
        <Route path="/patient-form" element={<PatientForm />} />
        <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor/availability" element={<DoctorAvailability />} />
        <Route path="/staff/dashboard" element={<StaffDashboard />} />
        <Route path="/staff/doctors" element={<StaffDoctors />} />
        <Route path="/pharmacy/dashboard" element={<PharmacyDashboard />} />
        <Route path="/:role/stat/:statId" element={<StatDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;