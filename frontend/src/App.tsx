import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { LoginPage } from './pages/LoginPage';
import { DashboardPage } from './pages/DashboardPage';
import { DevicesPage } from './pages/DevicesPage';
import { DeviceDetailPage } from './pages/DeviceDetailPage';
import { RoomsPage } from './pages/RoomsPage';
import { RoomDetailPage } from './pages/RoomDetailPage';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
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
          </Route>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
