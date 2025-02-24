import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Login from './pages/Login';
import Register from './pages/Register';
import LandlordDashboard from './pages/LandlordDashboard';
import TenantDashboard from './pages/TenantDashboard';
import PropertyDetails from './pages/PropertyDetails'; // New component
import './styles/App.css';

const App = () => {
  const token = localStorage.getItem('token');

  const ProtectedRoute = ({ children, accountType }) => {
    const decodedToken = token ? jwtDecode(token) : null;
    if (!token || (decodedToken && decodedToken.accountType !== accountType)) {
      return <Navigate to="/login" replace />;
    }
    return children;
  };

  return (
    <div className="App">
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landlord" element={<ProtectedRoute accountType="landlord"><LandlordDashboard /></ProtectedRoute>} />
        <Route path="/tenant" element={<ProtectedRoute accountType="tenant"><TenantDashboard /></ProtectedRoute>} />
        <Route path="/properties/:id" element={<ProtectedRoute accountType="landlord"><PropertyDetails /></ProtectedRoute>} /> {/* New route */}
        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;