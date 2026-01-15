import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import SearchResults from './pages/SearchResults';
import SeatSelection from './pages/SeatSelection';
import AboutPage from './pages/AboutPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import UserDashboard from './pages/UserDashboard';
import BookingSuccess from './pages/BookingSuccess';

// Admin Imports
import AdminLayout from './layouts/AdminLayout';
import StationsPage from './pages/admin/StationsPage';
import TrainsPage from './pages/admin/TrainsPage';
import StatsPage from './pages/admin/StatsPage';
// import AdminDashboard from './pages/admin/AdminDashboard'; // Deprecated/Placeholder

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* User Routes (with Navbar) */}
          <Route path="/" element={
            <>
              <Navbar />
              <HomePage />
            </>
          } />
          <Route path="/search" element={<><Navbar /><SearchResults /></>} />
          <Route path="/book/:trainId" element={<><Navbar /><SeatSelection /></>} />
          <Route path="/login" element={<><Navbar /><LoginPage /></>} />
          <Route path="/signup" element={<><Navbar /><SignupPage /></>} />
          <Route path="/about" element={<><Navbar /><AboutPage /></>} />
          <Route path="/booking-success" element={<><Navbar /><BookingSuccess /></>} />

          {/* Protected Parameters (User) */}
          <Route element={<PrivateRoute />}>
            <Route path="/dashboard" element={<><Navbar /><UserDashboard /></>} />
          </Route>

          {/* Admin Routes (Wrapped in AdminLayout) */}
          <Route path="/admin" element={<PrivateRoute requiredRole="ADMIN"><AdminLayout /></PrivateRoute>}>
            <Route index element={<Navigate to="/admin/stats" replace />} />
            <Route path="stations" element={<StationsPage />} />
            <Route path="trains" element={<TrainsPage />} />
            <Route path="stats" element={<StatsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
