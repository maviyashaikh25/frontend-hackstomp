import { Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import AshaLoginPage from './pages/AshaLoginPage'
import DoctorDashboard from './pages/DoctorDashboard'
import DoctorPatientsPage from './pages/DoctorPatientsPage'
import DoctorAnalyticsPage from './pages/DoctorAnalyticsPage'
import DoctorScheduledMeetingsPage from './pages/DoctorScheduledMeetingsPage'
import DoctorAuthPage from './pages/DoctorAuthPage'
import AshaDashboard from './pages/AshaDashboard'
import PatientHistoryPage from './pages/PatientHistoryPage'
import AshaRequestsPage from './pages/AshaRequestsPage'
import UserLoginPage from './pages/UserLoginPage'
import UserHistoryPage from './pages/UserHistoryPage'
import UserDashboard from './pages/UserDashboard'
import { LanguageProvider } from './context/LanguageContext'

export default function App() {
  return (
    <LanguageProvider>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/asha-login" element={<AshaLoginPage />} />
        <Route path="/asha-dashboard" element={<AshaDashboard />} />
        <Route path="/asha-dashboard/requests" element={<AshaRequestsPage />} />
        <Route path="/doctor-login" element={<DoctorAuthPage />} />
        <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
        <Route path="/doctor-dashboard/scheduled-meetings" element={<DoctorScheduledMeetingsPage />} />
        <Route path="/doctor-dashboard/patients" element={<DoctorPatientsPage />} />
        <Route path="/doctor-dashboard/analytics" element={<DoctorAnalyticsPage />} />
        <Route path="/patient/:patientId/history" element={<PatientHistoryPage />} />
        <Route path="/user-login" element={<UserLoginPage />} />
        <Route path="/user-dashboard" element={<UserDashboard />} />
        <Route path="/user-history" element={<UserHistoryPage />} />
      </Routes>
    </LanguageProvider>
  )
}
