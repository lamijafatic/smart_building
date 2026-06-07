import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';
import { BuildingPage } from './pages/BuildingPage';
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminOverviewPage } from './pages/admin/AdminOverviewPage';
import { AdminBuildingsPage } from './pages/admin/AdminBuildingsPage';
import { AdminApartmentsPage } from './pages/admin/AdminApartmentsPage';
import { AdminRoomsPage } from './pages/admin/AdminRoomsPage';
import { AdminUsersPage } from './pages/admin/AdminUsersPage';
import { AdminStatsPage } from './pages/admin/AdminStatsPage';

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />

            {/* Resident routes */}
            <Route
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/devices" element={<DevicesPage />} />
              <Route path="/devices/:id" element={<DeviceDetailPage />} />
              <Route path="/rooms" element={<RoomsPage />} />
              <Route path="/rooms/:id" element={<RoomDetailPage />} />
              <Route path="/building" element={<BuildingPage />} />
            </Route>

            {/* Admin routes */}
            <Route
              element={
                <ProtectedRoute requireAdmin>
                  <AdminLayout />
                </ProtectedRoute>
              }
            >
              {/* /admin = buildings list (overview) */}
              <Route path="/admin" element={<AdminOverviewPage />} />
              {/* /admin/buildings/:id = building detail with apartments */}
              <Route path="/admin/buildings/:id" element={<AdminBuildingsPage />} />
              {/* /admin/apartments/:id = apartment detail with rooms */}
              <Route path="/admin/apartments/:id" element={<AdminApartmentsPage />} />
              {/* /admin/rooms/:id = room detail with devices */}
              <Route path="/admin/rooms/:id" element={<AdminRoomsPage />} />
              <Route path="/admin/users" element={<AdminUsersPage />} />
              <Route path="/admin/stats" element={<AdminStatsPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
