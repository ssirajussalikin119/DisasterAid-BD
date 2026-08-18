import { Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import GuestRoute from '../middleware/GuestRoute';
import ProtectedRoute from '../middleware/ProtectedRoute';
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AccountPage from '../pages/AccountPage';
import ApplyNgoPage from '../pages/ApplyNgoPage';
import ApplyVolunteerPage from '../pages/ApplyVolunteerPage';
import DoctorDashboardPage from '../pages/DoctorDashboardPage';
import IncidentListPage from '../pages/IncidentListPage';
import HomePage from '../pages/HomePage';
import LoginPage from '../pages/LoginPage';
import MapPage from '../pages/MapPage';
import NgoDashboardPage from '../pages/NgoDashboardPage';
import NotFoundPage from '../pages/NotFoundPage';
import RegisterPage from '../pages/RegisterPage';
import VolunteerDashboardPage from '../pages/VolunteerDashboardPage';

export default function AppRouter() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/incidents" element={<IncidentListPage />} />
        <Route path="/map" element={<MapPage />} />
        <Route
          path="/login"
          element={
            <GuestRoute>
              <LoginPage />
            </GuestRoute>
          }
        />
        <Route
          path="/register"
          element={
            <GuestRoute>
              <RegisterPage />
            </GuestRoute>
          }
        />
        <Route
          path="/account"
          element={
            <ProtectedRoute>
              <AccountPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/apply-volunteer"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <ApplyVolunteerPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/account/apply-ngo"
          element={
            <ProtectedRoute allowedRoles={['citizen']}>
              <ApplyNgoPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/volunteer-dashboard"
          element={
            <ProtectedRoute allowedRoles={['volunteer']}>
              <VolunteerDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ngo-dashboard"
          element={
            <ProtectedRoute allowedRoles={['ngo']}>
              <NgoDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={['doctor']}>
              <DoctorDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="/dashboard" element={<Navigate to="/account" replace />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
