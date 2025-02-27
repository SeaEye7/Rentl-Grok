import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import Register from './pages/Register';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertyDetails from './pages/PropertyDetails'; // New component
import NotFound from './pages/NotFound'; // Create this if not already present
import './styles/App.css';

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAuthenticated(true);
        setUserRole(decodedToken.role || decodedToken.accountType); // Use 'role' or 'accountType' based on your token structure
      } catch (err) {
        console.error('Token decoding error:', err);
        localStorage.removeItem('token');
        setIsAuthenticated(false);
        setUserRole(null);
      }
    } else {
      setIsAuthenticated(false);
      setUserRole(null);
    }
  }, []);

  const PrivateRoute = ({ children, allowedRoles }) => {
    const token = localStorage.getItem('token');
    if (!token) {
      return <Navigate to="/login" replace />;
    }

    try {
      const decodedToken = jwtDecode(token);
      const role = decodedToken.role || decodedToken.accountType;
      if (!allowedRoles.includes(role)) {
        return <Navigate to={role === 'landlord' ? '/landlord' : '/tenant'} replace />;
      }
      return children;
    } catch (err) {
      console.error('Token validation error:', err);
      localStorage.removeItem('token');
      return <Navigate to="/login" replace />;
    }
  };

  return (
    <Router>
      <div className="app" style={{ backgroundColor: '#c4c4c4', fontFamily: 'Arial, sans-serif' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/landlord"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <LandlordDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/tenant"
            element={
              <PrivateRoute allowedRoles={['tenant']}>
                <TenantDashboard />
              </PrivateRoute>
            }
          />
          <Route
            path="/properties/:id"
            element={
              <PrivateRoute allowedRoles={['landlord', 'tenant']}>
                <PropertyDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/properties/:id/payments"
            element={
              <PrivateRoute allowedRoles={['landlord', 'tenant']}>
                <PropertyDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/properties/:id/maintenance"
            element={
              <PrivateRoute allowedRoles={['landlord', 'tenant']}>
                <PropertyDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/properties/:id/messages"
            element={
              <PrivateRoute allowedRoles={['landlord', 'tenant']}>
                <PropertyDetails />
              </PrivateRoute>
            }
          />
          <Route
            path="/landlord/payments"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <div className="section-content"><h1>Payments</h1><p>Payments management for landlords (to be implemented later).</p></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/landlord/messages"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <div className="section-content"><h1>Messages</h1><p>Landlord-tenant messaging (to be implemented later).</p></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/landlord/maintenance"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <div className="section-content"><h1>Maintenance</h1><p>Maintenance requests management (to be implemented later).</p></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/landlord/reports"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <div className="section-content"><h1>Reports</h1><p>Tax, expenses, and profit/loss reports (to be implemented later).</p></div>
              </PrivateRoute>
            }
          />
          <Route
            path="/landlord/files"
            element={
              <PrivateRoute allowedRoles={['landlord']}>
                <div className="section-content"><h1>File System</h1><p>File uploads and management (to be implemented later).</p></div>
              </PrivateRoute>
            }
          />
          <Route path="*" element={<NotFound />} /> {/* 404 Not Found */}
        </Routes>
      </div>
    </Router>
  );
};

export default App;